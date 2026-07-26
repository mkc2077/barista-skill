import { LLMAdapter, ChatMessage, chatOnce } from './llm-adapter'

export class MCPClient {
  url: string
  private _id: number = 1
  private _toolsCache: any[] | null = null

  constructor(url: string) {
    this.url = url
  }

  async _rpc(method: string, params: any, signal?: AbortSignal): Promise<any> {
    const resp = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params: params || {},
        id: this._id++,
      }),
      signal,
    })
    if (!resp.ok) throw new Error(`MCP 错误 (${resp.status}): ${await resp.text()}`)

    // MCP 1.28+ returns SSE format (text/event-stream): "event: message\ndata: {json}\n\n"
    // Extract the JSON from the data: lines
    const text = await resp.text()
    let data: any
    if (text.trim().startsWith('{')) {
      // Plain JSON response
      data = JSON.parse(text)
    } else {
      // SSE format: find the last data: line and parse it
      const dataLines = text.split('\n').filter(l => l.startsWith('data:'))
      if (dataLines.length === 0) throw new Error('MCP: 响应中无 data 行')
      // Use the last data line (final result)
      const jsonStr = dataLines[dataLines.length - 1].slice(5).trim()
      data = JSON.parse(jsonStr)
    }
    if (data.error) throw new Error(`MCP: ${data.error.message || JSON.stringify(data.error)}`)
    return data.result
  }

  async listTools(signal?: AbortSignal): Promise<any[]> {
    const cached = this._toolsCache
    if (cached) return cached
    const result = await this._rpc('tools/list', {}, signal)
    this._toolsCache = result.tools || []
    return this._toolsCache!
  }

  async callTool(name: string, args: any, signal?: AbortSignal): Promise<string> {
    const result = await this._rpc('tools/call', { name, arguments: args || {} }, signal)
    if (result.content) {
      return result.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n')
    }
    return JSON.stringify(result)
  }

  toOpenAITools(mcpTools: any[]): any[] {
    return mcpTools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: (t.description || '').substring(0, 1024),
        parameters: t.inputSchema || { type: 'object', properties: {} },
      },
    }))
  }
}

export interface MCPProgressCallback {
  (status: string): void
}

export async function chatWithMCP(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  mcpUrl: string,
  onProgress: MCPProgressCallback,
  signal?: AbortSignal
): Promise<string> {
  const mcp = new MCPClient(mcpUrl)

  onProgress('🔧 正在连接 MCP Server...')
  let tools: any[]
  try {
    const mcpTools = await mcp.listTools(signal)
    tools = mcp.toOpenAITools(mcpTools)
  } catch (err: any) {
    throw new Error(
      `MCP 连接失败: ${err.message}\n请确认 MCP Server 已启动（运行 start.bat / start.sh），且地址正确。`
    )
  }
  onProgress(`✅ 已加载 ${tools.length} 个工具，正在思考...`)

  const workingMessages = [...messages]
  const MAX_TOOL_ROUNDS = 8

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const assistantMsg = await chatOnce(adapter, workingMessages, tools, signal)

    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const content = assistantMsg.content || ''
      onProgress(content || '（空回复）')
      return content
    }

    workingMessages.push(assistantMsg)

    for (const tc of assistantMsg.tool_calls) {
      const toolName = tc.function.name
      let args: any = {}
      try {
        args = JSON.parse(tc.function.arguments || '{}')
      } catch {}

      onProgress(`🔧 调用工具: ${toolName}...`)

      let toolResult: string
      try {
        toolResult = await mcp.callTool(toolName, args, signal)
      } catch (err: any) {
        toolResult = `工具调用失败: ${err.message}`
      }

      workingMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        name: toolName,
        content: toolResult,
      })
    }

    onProgress('☕ 正在根据工具结果思考...')
  }

  const fallback = '（工具调用轮次已达上限，请简化问题后重试）'
  onProgress(fallback)
  return fallback
}