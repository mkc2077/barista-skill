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
  const abortRef = useRef<AbortController | null>(null)

  const settings = useStore((s) => s.settings)
  const streaming = useStore((s) => s.streaming)
  const setStreaming = useStore((s) => s.setStreaming)
  const addMessage = useStore((s) => s.addMessage)
  const updateMessage = useStore((s) => s.updateMessage)
  const appendCards = useStore((s) => s.appendCards)
  const create = useStore((s) => s.createConversation)
  const openSettings = useStore((s) => s.setShowSettings)
  const current = useCurrentConversation()

  const getSystemPrompt = () => settings.systemPrompt || DEFAULT_SYSTEM_PROMPT

  const autoResize = useCallback(() => {
    const t = textareaRef.current
    if (t) {
      t.style.height = 'auto'
      t.style.height = Math.min(t.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSend = async () => {
    if (streaming) {
      abortRef.current?.abort()
      return
    }

    const text = input.trim()
    if (!text) return

    const adapter = getAdapter(settings)
    if (!adapter) {
      openSettings(true)
      return
    }

    let systemPrompt = getSystemPrompt()
    let webFail = false
    if (settings.webSearchOn) {
      try {
        const ctx = await webSearch(text, settings.anysearchKey)
        if (ctx) systemPrompt += '\n\n' + ctx
        else webFail = true
      } catch (e) {
        console.warn('[websearch] failed:', e)
        webFail = true
      }
    }

    let convId = current?.id
    if (!convId) {
      convId = create()
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage(convId, { role: 'user', content: text })

    const history = useStore.getState().conversations.find(c => c.id === convId)?.messages || []
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    const assistantId = addMessage(convId, { role: 'assistant', content: '' })

    setStreaming(true)
    abortRef.current = new AbortController()
    const cards: ToolCard[] = []

    let full = webFail ? '⚠️ 联网搜索不可用，已用本地知识库回答。\n\n' : ''

    try {
      if (settings.mcpServerOn && settings.mcpServerUrl) {
        full = await chatWithMCP(
          adapter, messages, settings.mcpServerUrl,
          (status) => updateMessage(convId!, assistantId, status),
          abortRef.current.signal,
          (toolName, raw) => {
            const parser = CARD_PARSERS[toolName]
            if (parser) {
              const data = parser(raw)
              if (data) cards.push({ tool: toolName, data })
            }
          },
        )
        if (cards.length > 0) appendCards(convId!, assistantId, cards)
      } else {
        for await (const chunk of adapter.chatStream(messages, abortRef.current.signal)) {
          full += chunk
          updateMessage(convId!, assistantId, full)
        }
      }

      if (!full) {
        updateMessage(convId!, assistantId, '（空回复，请检查 API 配置或重试）')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateMessage(convId!, assistantId, full + (full ? '\n\n_（已停止）_' : '（已停止）'))
      } else {
        updateMessage(convId!, assistantId, '⚠ ' + err.message)
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='px-4 py-3 bg-[var(--surface)] border-t border-[var(--rule)]'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-end gap-2 surface-inset px-3 py-2.5 rounded-xl'>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder='输入消息... (Enter 发送 / Shift+Enter 换行)'
            className='flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[120px] placeholder:opacity-50'
          />
          <button
            onClick={handleSend}
            className='shrink-0 flex items-center justify-center px-2.5 py-2.5 rounded-xl text-white font-medium text-sm btn-primary'
            aria-label={streaming ? 'Stop' : 'Send'}
          >
            {streaming ? <Square className='w-4 h-4' strokeWidth={1.5} /> : <Send className='w-4 h-4' strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  )
}
