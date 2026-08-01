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
    if (confirm('删除此对话？')) {
      deleteConversation(currentConversation.id)
    }
  }

  const meta = [settings.provider || '--', settings.model]
  if (settings.mcpEnabled) meta.push('MCP')
  if (settings.webSearchEnabled) meta.push('WEB')

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-secondary">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-keystroke text-[10px] uppercase tracking-wider theme-text-dim truncate">
            {meta.filter(Boolean).join(' · ')}
          </span>
          <h2 className="font-editorial text-lg theme-primary truncate">{currentConversation.title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-theme-hover rounded-xl transition-colors ease-editorial" title="Settings">
            <Settings className="w-4 h-4 theme-text-dim" strokeWidth={1.5} />
          </button>
          <button onClick={handleClear} className="p-2 hover:bg-theme-hover rounded-xl transition-colors ease-editorial" title="Delete">
            <Trash2 className="w-4 h-4 theme-text-dim hover:text-theme-danger" strokeWidth={1.5} />
          </button>
        </div>
      </header>
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-8">
        <div className="space-y-5">
          {currentConversation.messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isNearBottom && currentConversation.messages.length > 0 && (
        <button onClick={scrollToBottom} className="absolute bottom-24 right-6 z-10 bezel-shell-sm bg-theme-secondary" aria-label="Scroll to bottom">
          <div className="bezel-core-sm p-1.5">
            <ArrowDown className="w-4 h-4 theme-text" strokeWidth={1.5} />
          </div>
        </button>
      )}

      <ChatInput />
    </div>
  )
}
