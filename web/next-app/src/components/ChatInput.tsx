'use client'

import { useState, useRef, useCallback } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { getAdapter } from '@/lib/llm-adapter'
import { chatWithMCP } from '@/lib/mcp-client'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { webSearch } from '@/lib/anysearch'
import { CARD_PARSERS } from '@/lib/card-parsers'
import type { ToolCard } from '@/store'
import { Send, Square } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const settings = useStore((s) => s.settings)
  const isStreaming = useStore((s) => s.isStreaming)
  const setStreaming = useStore((s) => s.setStreaming)
  const addMessage = useStore((s) => s.addMessage)
  const updateMessage = useStore((s) => s.updateMessage)
  const appendCards = useStore((s) => s.appendCards)
  const createConversation = useStore((s) => s.createConversation)
  const setShowSettings = useStore((s) => s.setShowSettings)
  const currentConversation = useCurrentConversation()

  const getSystemPrompt = () => settings.customPrompt || DEFAULT_SYSTEM_PROMPT

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSend = async () => {
    if (isStreaming) {
      abortControllerRef.current?.abort()
      return
    }

    const text = input.trim()
    if (!text) return

    const adapter = getAdapter(settings)
    if (!adapter) {
      setShowSettings(true)
      return
    }

    // 联网搜索（Scheme B）：在拼装 system prompt 前先拉取 AnySearch 参考资料
    let systemPrompt = getSystemPrompt()
    // 联网搜索任一失败路径（抛错 / 返空）都给用户一个可见信号，避免被误以为已经联网
    let webSearchFail = false
    if (settings.webSearchEnabled) {
      try {
        const ctx = await webSearch(text, settings.anysearchApiKey)
        if (ctx) systemPrompt += '\n\n' + ctx
        else webSearchFail = true
      } catch (e) {
        console.warn('[webSearch] AnySearch 调用失败，跳过联网搜索：', e)
        webSearchFail = true
      }
    }

    let convId = currentConversation?.id
    if (!convId) {
      convId = createConversation()
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage(convId, { role: 'user', content: text })

    const history = useStore.getState().conversations.find(c => c.id === convId)?.messages || []
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    const assistantMsgId = addMessage(convId, { role: 'assistant', content: '' })

    setStreaming(true)
    abortControllerRef.current = new AbortController()
    const cards: ToolCard[] = []

    let fullResponse = webSearchFail ? '⚠️ 联网搜索不可用，已用离线知识库回答。\n\n' : ''

    try {
      if (settings.mcpEnabled && settings.mcpUrl) {
        fullResponse = await chatWithMCP(
          adapter,
          messages,
          settings.mcpUrl,
          (status) => {
            updateMessage(convId!, assistantMsgId, status)
          },
          abortControllerRef.current.signal,
          (toolName, raw) => {
            const parser = CARD_PARSERS[toolName]
            if (parser) {
              const data = parser(raw)
              if (data) cards.push({ tool: toolName, data })
            }
          },
        )
        if (cards.length > 0) {
          appendCards(convId!, assistantMsgId, cards)
        }
      } else {
        for await (const chunk of adapter.chatStream(messages, abortControllerRef.current.signal)) {
          fullResponse += chunk
          updateMessage(convId!, assistantMsgId, fullResponse)
        }
      }

      if (!fullResponse) {
        updateMessage(convId!, assistantMsgId, '（空回复，请检查 API 配置或重试）')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const finalContent = fullResponse + (fullResponse ? '\n\n_（已停止）_' : '（已停止）')
        updateMessage(convId!, assistantMsgId, finalContent)
      } else {
        updateMessage(convId!, assistantMsgId, `⚠ ${err.message}`)
      }
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    // Nested bezel input: outer tray holds a textarea + nested circular CTA side-by-side
    <div className="px-4 py-3 bg-theme-secondary">
      <div className="bezel-shell-sm bg-transparent flex items-end gap-2 max-w-3xl mx-auto">
        <div className="bezel-core-sm flex-1 flex items-end gap-2 px-3 py-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="输入消息... (Enter 发送 · Shift+Enter 换行)"
            className="flex-1 bg-transparent text-sm resize-none outline-none
              min-h-[24px] max-h-[120px] placeholder:theme-text-dim"
          />
        </div>
        <button
          onClick={handleSend}
          className={`shrink-0 w-10 h-10 rounded-[0.75rem] flex items-center justify-center
            text-white transition-all press-physics ease-editorial
            ${isStreaming ? 'bg-theme-danger' : 'bg-theme-primary'}`}
          aria-label={isStreaming ? '停止' : '发送'}
        >
          {isStreaming ? <Square className="w-4 h-4" strokeWidth={1.5} /> : <Send className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}
