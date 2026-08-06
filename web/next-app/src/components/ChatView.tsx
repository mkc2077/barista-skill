'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ArrowDown, Trash2, Settings } from 'lucide-react'
import { getModule } from '@/lib/modules'

export function ChatView() {
  const current = useCurrentConversation()
  const remove = useStore((s) => s.deleteConversation)
  const openSettings = useStore((s) => s.setShowSettings)
  const settings = useStore((s) => s.settings)
  const endRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [nearBottom, setNearBottom] = useState(true)

  const checkNear = useCallback(() => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }, [])

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    setNearBottom(true)
  }, [])

  useEffect(() => {
    if (nearBottom) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [current?.messages, nearBottom])

  if (!current) return null

  const handleClear = () => {
    if (confirm('Delete this conversation?')) remove(current.id)
  }

  const meta = [settings.provider || '--', settings.model].filter(Boolean)
  if (settings.mcpServerOn) meta.push('MCP')
  if (settings.webSearchOn) meta.push('WEB')

  return (
    <div className='flex flex-col h-screen'>
      <header className='relative flex items-center justify-between px-6 py-3.5 border-b border-[var(--rule)]'>
        <div className='absolute inset-0 pointer-events-none' style={{
          background: 'var(--glass-bg)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          backdropFilter: 'blur(20px) saturate(1.8)',
        }} />
        <div className='relative flex items-center gap-3 min-w-0 ml-12'>
          <span className='px-1.5 py-0.5 rounded-md text-[10px] font-keystroke uppercase tracking-widest border border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)] shrink-0'>
            {getModule(current.moduleId || settings.currentModule).label.zh}
          </span>
          <div className='flex flex-col gap-0.5 min-w-0'>
            <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)] truncate'>
              {meta.join('  ·  ')}
            </span>
            <h2 className='font-editorial text-lg text-[var(--text)] truncate leading-tight'>
              {current.title}
            </h2>
          </div>
        </div>
        <div className='relative flex items-center gap-1'>
          <button onClick={() => openSettings(true)} className='btn-icon' data-tooltip='Settings'>
            <Settings className='w-4 h-4' strokeWidth={1.5} />
          </button>
          <button onClick={handleClear} className='btn-icon' data-tooltip='Delete conversation'>
            <Trash2 className='w-4 h-4' strokeWidth={1.5} style={{ color: 'var(--danger)' }} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} onScroll={() => setNearBottom(checkNear())} className='flex-1 overflow-y-auto px-4 py-8'>
        <div className='space-y-6 max-w-3xl mx-auto'>
          {current.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {!nearBottom && current.messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className='absolute bottom-24 right-6 z-10 p-2 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] shadow-md'
          aria-label='Scroll to bottom'
        >
          <ArrowDown className='w-4 h-4 text-[var(--text)]' strokeWidth={1.5} />
        </button>
      )}

      <ChatInput />
    </div>
  )
}
