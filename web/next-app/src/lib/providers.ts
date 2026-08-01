export interface ProviderConfig {
  name: string
  baseUrl: string
  models: string[]
  defaultModel: string
  type: 'openai' | 'anthropic'
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-4o', 'gpt-4o-mini'],
    defaultModel: 'gpt-5.4-mini',
    type: 'openai',
  },
  anthropic: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
    defaultModel: 'claude-sonnet-4-5',
    type: 'anthropic',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
    defaultModel: 'deepseek-v4-flash',
    type: 'openai',
  },
  qwen: {
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen3.7-max', 'qwen3.7-plus', 'qwen3.7-flash'],
    defaultModel: 'qwen3.7-plus',
    type: 'openai',
  },
  moonshot: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['kimi-k2-turbo', 'kimi-k2-thinking', 'moonshot-v1-128k'],
    defaultModel: 'kimi-k2-turbo',
    type: 'openai',
  },
  glm: {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-5', 'glm-4-plus', 'glm-4-flash', 'glm-4-air'],
    defaultModel: 'glm-4-flash',
    type: 'openai',
  },
  ollama: {
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    models: ['llama3.3', 'qwen3', 'gemma3', 'phi4'],
    defaultModel: 'qwen3',
    type: 'openai',
  },
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    defaultModel: 'gemini-2.5-flash',
    type: 'openai',
  },
  mistral: {
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    defaultModel: 'mistral-small-latest',
    type: 'openai',
  },
  grok: {
    name: 'xAI Grok',
    baseUrl: 'https://api.x.ai/v1',
    models: ['grok-4', 'grok-4-mini', 'grok-2'],
    defaultModel: 'grok-4-mini',
    type: 'openai',
  },
  minimax: {
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    models: ['abab7-preview', 'MiniMax-Text-01'],
    defaultModel: 'MiniMax-Text-01',
    type: 'openai',
  },
  hunyuan: {
    name: '腾讯混元 (Hunyuan)',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
    models: ['hunyuan-turbos-latest', 'hunyuan-large', 'hunyuan-standard'],
    defaultModel: 'hunyuan-turbos-latest',
    type: 'openai',
  },
  siliconflow: {
    name: '硬基流动 (SiliconFlow)',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'meta-llama/Llama-3.3-70B-Instruct'],
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    type: 'openai',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.5-flash'],
    defaultModel: 'openai/gpt-4o',
    type: 'openai',
  },
  baichuan: {
    name: '百川 (Baichuan)',
    baseUrl: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4-Turbo', 'Baichuan4-Air'],
    defaultModel: 'Baichuan4-Turbo',
    type: 'openai',
  },
    custom: {
    name: '自定义 (OpenAI 兼容)',
    baseUrl: '',
    models: [],
    defaultModel: '',
    type: 'openai',
  },
}

/**
 * 从供应商 API 的 /models 端点获取可用模型列表。
 * 支持 OpenAI 兼容格式和 Anthropic 原生格式。
 */
export async function fetchModels(
  providerKey: string,
  baseUrl: string,
  apiKey: string
): Promise<string[]> {
  const config = PROVIDERS[providerKey]
  const url = `${baseUrl.replace(/\/+$/, '')}/models`

  const headers: Record<string, string> = {}

  if (config?.type === 'anthropic') {
    if (apiKey) headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else {
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  }

  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '')
    throw new Error(`HTTP ${resp.status}${errText ? ': ' + errText.slice(0, 200) : ''}`)
  }

  const data = await resp.json()
  const models: string[] = (data.data || data.models || [])
    .map((m: { id?: string; name?: string }) => m.id || m.name)
    .filter((v: string | undefined): v is string => Boolean(v))

  return models
}
