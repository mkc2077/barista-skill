/**
 * AnySearch 联网搜索客户端（Scheme B 本地版使用）。
 *
 * AnySearch 是面向 AI Agent 的统一搜索基础设施：
 *   - REST:  POST https://api.anysearch.com/v1/search
 *   - 文档:  https://www.anysearch.com/docs
 *   - 鉴权:  Authorization: Bearer <API_KEY>（可选；留空走匿名免费额度，按 IP 限流）
 *
 * 这里由浏览器直接调用（用户自带 Key，密钥只发往 api.anysearch.com 本服务）。
 * 若因 CORS / 网络失败，调用方应优雅降级（不阻断对话）。
 */

export interface AnySearchResult {
  title: string
  url: string
  snippet?: string
  content?: string
}

export interface AnySearchResponse {
  results?: AnySearchResult[]
  metadata?: Record<string, unknown>
}

const ANYSEARCH_ENDPOINT = 'https://api.anysearch.com/v1/search'

/**
 * 执行一次联网搜索，返回可直接塞进 system prompt 的参考资料文本。
 * 无结果或失败均返回空字符串（由调用方决定降级行为）。
 */
export async function webSearch(
  query: string,
  apiKey?: string,
  maxResults = 5,
): Promise<string> {
  const payload = {
    query,
    max_results: maxResults,
    format: 'markdown',
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`
  }

  const res = await fetch(ANYSEARCH_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`AnySearch 请求失败：HTTP ${res.status}`)
  }

  const data = (await res.json()) as AnySearchResponse
  const results = Array.isArray(data?.results) ? data.results : []
  if (results.length === 0) return ''

  const blocks = results.slice(0, maxResults).map((r, i) => {
    const snippet = (r.snippet || r.content || '').trim()
    return `${i + 1}. ${r.title}\n   ${r.url}${snippet ? `\n   ${snippet}` : ''}`
  })

  return `以下是联网搜索（AnySearch）返回的参考资料，请在回答中优先采用并注明来源：\n\n${blocks.join('\n\n')}`
}

/**
 * 同 webSearch，但额外返回原始结果数组，便于「更新知识库」把每条结果
 * 存为一条 KnowledgeNote。
 */
export async function webSearchRaw(
  query: string,
  apiKey?: string,
  maxResults = 5,
): Promise<{ markdown: string; results: AnySearchResult[] }> {
  const payload = { query, max_results: maxResults, format: 'markdown' }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey && apiKey.trim()) headers['Authorization'] = `Bearer ${apiKey.trim()}`
  const res = await fetch(ANYSEARCH_ENDPOINT, { method: 'POST', headers, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error(`AnySearch 请求失败：HTTP ${res.status}`)
  const data = (await res.json()) as AnySearchResponse
  const results = Array.isArray(data?.results) ? data.results : []
  const blocks = results.slice(0, maxResults).map((r, i) => {
    const snippet = (r.snippet || r.content || '').trim()
    return `${i + 1}. ${r.title}\n   ${r.url}${snippet ? `\n   ${snippet}` : ''}`
  })
  const markdown = blocks.length
    ? `以下是联网搜索（AnySearch）返回的参考资料，请在回答中优先采用并注明来源：\n\n${blocks.join('\n\n')}`
    : ''
  return { markdown, results }
}
