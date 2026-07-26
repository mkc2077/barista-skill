'use client'

import { useState, useRef, useCallback } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { getAdapter } from '@/lib/llm-adapter'
import { chatWithMCP } from '@/lib/mcp-client'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
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

    let convId = currentConversation?.id
    if (!convId) {
      convId = createConversation()
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage(convId, { role: 'user', content: text })

    const systemPrompt = getSystemPrompt()
    const history = useStore.getState().conversations.find(c => c.id === convId)?.messages || []
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    const assistantMsgId = addMessage(convId, { role: 'assistant', content: '' })

    setStreaming(true)
    abortControllerRef.current = new AbortController()

    let fullResponse = ''

    try {
      if (settings.mcpEnabled && settings.mcpUrl && adapter.type !== 'anthropic') {
        fullResponse = await chatWithMCP(
          adapter,
          messages,
          settings.mcpUrl,
          (status) => {
            updateMessage(convId!, assistantMsgId, status)
          },
          abortControllerRef.current.signal
        )
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
    <div className="px-4 py-3 border-t border-theme-border bg-theme-secondary flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => { setInput(e.target.value); autoResize() }}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        className="flex-1 bg-theme-chat border border-theme-border rounded-xl px-4 py-2.5
          text-sm resize-none outline-none focus:border-theme-accent transition-colors
          min-h-[42px] max-h-[120px]"
      />
      <button
        onClick={handleSend}
        className={`px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all
          min-h-[42px] flex items-center gap-1.5
          ${isStreaming
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-theme-primary hover:opacity-90'
          }`}
      >
        {isStreaming ? (
          <>
            <Square className="w-4 h-4" />
            停止
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            发送
          </>
        )}
      </button>
    </div>
  )
}
