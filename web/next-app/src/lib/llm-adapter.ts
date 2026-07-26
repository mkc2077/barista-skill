import { PROVIDERS } from './providers'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

export class LLMAdapter {
  type: 'openai' | 'anthropic'
  apiKey: string
  baseUrl: string
  model: string
  temperature: number

  constructor(cfg: {
    providerType: 'openai' | 'anthropic'
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
  }) {
    this.type = cfg.providerType || 'openai'
    this.apiKey = cfg.apiKey
    this.baseUrl = (cfg.baseUrl || '').replace(/\/+$/, '')
    this.model = cfg.model
    this.temperature = cfg.temperature ?? 0.7
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    if (this.type === 'anthropic') {
      yield* this._streamAnthropic(messages, signal)
    } else {
      yield* this._streamOpenAI(messages, signal)
    }
  }

  async *_streamOpenAI(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    const url = `${this.baseUrl}/chat/completions`
    const body = {
      model: this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: this.temperature,
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal })
    if (!resp.ok) {
      const errText = await resp.text()
      let errMsg = `API 错误 (${resp.status})`
      try {
        const e = JSON.parse(errText)
        errMsg += `: ${e.error?.message || e.message || errText}`
      } catch {
        errMsg += `: ${errText.substring(0, 200)}`
      }
      throw new Error(errMsg)
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {}
      }
    }
  }

  async *_streamAnthropic(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    const url = `${this.baseUrl}/messages`
    const sysMsg = messages.find(m => m.role === 'system')
    const chatMsgs = messages.filter(m => m.role !== 'system')
    const body: Record<string, any> = {
      model: this.model,
      messages: chatMsgs.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 4096,
      stream: true,
      temperature: this.temperature,
    }
    if (sysMsg) body.system = sysMsg.content
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }

    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal })
    if (!resp.ok) {
      const errText = await resp.text()
      let errMsg = `API 错误 (${resp.status})`
      try {
        const e = JSON.parse(errText)
        errMsg += `: ${e.error?.message || e.message || errText}`
      } catch {
        errMsg += `: ${errText.substring(0, 200)}`
      }
      throw new Error(errMsg)
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          if (json.type === 'content_block_delta' && json.delta?.text) {
            yield json.delta.text
          }
        } catch {}
      }
    }
  }
}

export async function chatOnce(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  tools?: any[],
  signal?: AbortSignal
): Promise<any> {
  const body: Record<string, any> = {
    model: adapter.model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
      ...(m.name ? { name: m.name } : {}),
    })),
    temperature: adapter.temperature,
    stream: false,
  }
  if (tools && tools.length) body.tools = tools
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (adapter.apiKey) headers['Authorization'] = `Bearer ${adapter.apiKey}`

  const resp = await fetch(`${adapter.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })
  if (!resp.ok) {
    const errText = await resp.text()
    let errMsg = `API 错误 (${resp.status})`
    try {
      const e = JSON.parse(errText)
      errMsg += `: ${e.error?.message || e.message || errText}`
    } catch {
      errMsg += `: ${errText.substring(0, 200)}`
    }
    throw new Error(errMsg)
  }
  const data = await resp.json()
  return data.choices?.[0]?.message || { role: 'assistant', content: '' }
}

export function getAdapter(
  settings: {
    provider: string
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
  }
): LLMAdapter | null {
  if (!settings.baseUrl || !settings.model) return null
  const isOllama = settings.provider === 'ollama'
  if (!settings.apiKey && !isOllama) return null
  const provider = PROVIDERS[settings.provider] || PROVIDERS.custom
  return new LLMAdapter({
    providerType: provider.type,
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model,
    temperature: settings.temperature,
  })
}