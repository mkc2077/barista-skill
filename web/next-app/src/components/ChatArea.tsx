'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ArrowDown, Trash2, Settings } from 'lucide-react'

export function ChatArea() {
  const currentConversation = useCurrentConversation()
  const deleteConversation = useStore((s) => s.deleteConversation)
  const setShowSettings = useStore((s) => s.setShowSettings)
  const settings = useStore((s) => s.settings)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }, [])

  const handleScroll = useCallback(() => {
    setIsNearBottom(checkIfNearBottom())
  }, [checkIfNearBottom])

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isNearBottom])

  if (!currentConversation) return null

  const handleClear = () => {
    if (confirm('确定删除此对话？')) {
      deleteConversation(currentConversation.id)
    }
  }

  const mcpTag = settings.mcpEnabled ? ' · MCP' : ''

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-theme-border bg-theme-secondary">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm">{currentConversation.title}</h2>
          <span className="text-xs theme-text-dim">
            {settings.provider || '未配置'} · {settings.model}{mcpTag}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4 theme-text-dim" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
            title="删除对话"
          >
            <Trash2 className="w-4 h-4 theme-text-dim hover:text-theme-danger" />
          </button>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="space-y-4">
          {currentConversation.messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isNearBottom && currentConversation.messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-10 p-2 rounded-full border border-theme-border
            bg-theme-secondary shadow-lg hover:scale-110 transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      <ChatInput />
    </div>
  )
}
