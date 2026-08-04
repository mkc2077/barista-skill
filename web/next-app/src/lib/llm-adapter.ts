import { PROVIDERS } from './providers'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | ImageContentPart[]
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

export interface ImageContentPart {
  type: 'image_url'
  image_url: { url: string; detail?: 'low' | 'high' | 'auto' }
}

function _openAIContent(m: ChatMessage): any {
  const msg = m as any;
  if (msg.images && msg.images.length > 0) {
    const parts: any[] = [{ type: "text", text: msg.content || "" }];
    for (const img of msg.images) parts.push({ type: "image_url", image_url: { url: img, detail: "auto" } });
    return parts;
  }
  return msg.content;
}

function _anthropicContent(m: ChatMessage): any {
  const msg = m as any;
  if (msg.images && msg.images.length > 0) {
    const parts: any[] = [{ type: "text", text: msg.content || "" }];
    for (const img of msg.images) {
      const u = String(img);
      const bi = u.indexOf("base64,");
      if (bi > 0) {
        const media_type = u.slice(u.indexOf(":") + 1, u.indexOf(";"));
        const data = u.slice(bi + 7);
        parts.push({ type: "image", source: { type: "base64", media_type, data } });
      }
    }
    return parts;
  }
  return msg.content;
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
      messages: messages.map(m => {
      // If the message has images, build content[] array (OpenAI vision format).
      // Otherwise plain string content.
      const msg = m as any;
      if (msg.images && msg.images.length > 0) {
        const parts: any[] = [{ type: 'text', text: msg.content || '' }];
        for (const img of msg.images) {
          parts.push({ type: 'image_url', image_url: { url: img, detail: 'auto' } });
        }
        return { role: m.role, content: parts };
      }
      return { role: m.role, content: m.content };
    }),
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
      messages: chatMsgs.map((m: ChatMessage) => ({ role: m.role, content: _anthropicContent(m) })),
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

/**
 * 非流式单次对话（MCP 工具循环用）。自动按 adapter.type 分发到 OpenAI / Anthropic 格式，
 * 返回值统一成 OpenAI chat-completions 的 message 形状（{ role, content, tool_calls? }），
 * 方便 chatWithMCP 循环消费，无需改动 mcp-client.ts。
 */
export async function chatOnce(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  tools?: any[],
  signal?: AbortSignal
): Promise<any> {
  if (adapter.type === 'anthropic') {
    return _chatOnceAnthropic(adapter, messages, tools, signal)
  }
  return _chatOnceOpenAI(adapter, messages, tools, signal)
}

/** OpenAI 兼容格式（也是 DeepSeek / Qwen / GLM / Ollama 等的约定）。 */
async function _chatOnceOpenAI(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  tools?: any[],
  signal?: AbortSignal
): Promise<any> {
  const body: Record<string, any> = {
    model: adapter.model,
    messages: messages.map(m => ({
      role: m.role,
      content: _openAIContent(m),
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

/**
 * Anthropic 原生格式：
 *  - system 提到顶层（不在 messages 数组里）；
 *  - tool 结果用 user 角色的 tool_result content block 承载（连续的同角色结果合并，避免被拒）；
 *  - assistant 的 tool_calls 拆成 text + tool_use content blocks；
 *  - OpenAI tools([{type:'function',function:{...}}]) -> Anthropic tools([{name,description,input_schema}])。
 */
async function _chatOnceAnthropic(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  tools?: any[],
  signal?: AbortSignal
): Promise<any> {
  const sysMsg = messages.find(m => m.role === 'system')
  const chatMsgs = messages.filter(m => m.role !== 'system')

  const anthropicMsgs: any[] = []
  for (const m of chatMsgs) {
    if (m.role === 'tool') {
      const block: any = {
        type: 'tool_result',
        tool_use_id: m.tool_call_id,
        content: m.content,
      }
      const last = anthropicMsgs[anthropicMsgs.length - 1]
      if (last && last.role === 'user' && Array.isArray(last.content)
          && last.content.every((b: any) => b.type === 'tool_result')) {
        last.content.push(block)
      } else {
        anthropicMsgs.push({ role: 'user', content: [block] })
      }
    } else if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length) {
      const content: any[] = []
      if (m.content) content.push({ type: 'text', text: m.content })
      for (const tc of m.tool_calls) {
        let input: any = {}
        try { input = JSON.parse(tc.function.arguments || '{}') } catch {}
        content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input })
      }
      anthropicMsgs.push({ role: 'assistant', content })
    } else {
      anthropicMsgs.push({ role: m.role, content: _anthropicContent(m) })
    }
  }

  const body: Record<string, any> = {
    model: adapter.model,
    messages: anthropicMsgs,
    max_tokens: 4096,
    stream: false,
    temperature: adapter.temperature,
  }
  if (sysMsg) body.system = sysMsg.content

  if (tools && tools.length) {
    body.tools = tools.map(t => {
      const fn = t.function || t
      return {
        name: fn.name,
        description: (fn.description || '').substring(0, 1024),
        input_schema: fn.parameters || fn.input_schema || { type: 'object', properties: {} },
      }
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': adapter.apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }

  const resp = await fetch(`${adapter.baseUrl}/messages`, {
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
  return _fromAnthropicResponse(data)
}

/** 把 Anthropic 的 content blocks 转回 OpenAI message 形状，供 chatWithMCP 循环消费。 */
function _fromAnthropicResponse(data: any): any {
  const blocks = data.content || []
  let text = ''
  const toolCalls: any[] = []
  for (const b of blocks) {
    if (b.type === 'text') text += b.text
    else if (b.type === 'tool_use') {
      toolCalls.push({
        id: b.id,
        type: 'function',
        function: { name: b.name, arguments: JSON.stringify(b.input) },
      })
    }
  }
  return {
    role: 'assistant',
    content: text,
    ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
  }
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