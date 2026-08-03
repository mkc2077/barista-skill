'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '@/store'
import { ToolCardView } from './cards'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.role === 'assistant' && message.content.startsWith('\u26a0')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const monogram = isUser ? '你' : isError ? '!' : 'B'

  return (
    <div className='flex gap-3 max-w-3xl mx-auto w-full animate-[msg-in_0.35s_cubic-bezier(0.16,1,0.3,1)_both]'>
      <div className='flex-shrink-0 mt-0.5'>
        <div
          className='w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium font-keystroke'
          style={{
            background: isUser ? 'var(--accent)' : isError ? 'var(--danger)' : 'var(--surface-raised)',
            color: isUser || isError ? 'var(--text-on-accent)' : 'var(--text-muted)',
            border: isUser || isError ? 'none' : '1px solid var(--border)',
          }}
        >
          {monogram}
        </div>
      </div>

      <div className='flex-1 group min-w-0'>
        <div
          className='px-4 py-3 text-sm leading-relaxed rounded-lg'
          style={{
            background: isUser ? 'var(--user-bubble)' : 'var(--surface)',
            color: isUser ? 'var(--user-text)' : 'var(--text)',
            border: isUser ? 'none' : '1px solid var(--border)',
          }}
        >
          {isUser ? (
            <p className='whitespace-pre-wrap'>{message.content}</p>
          ) : (
            <>
              {message.cards && message.cards.length > 0 && (
                <div className='mb-2 space-y-2'>
                  {message.cards.map((c, i) => (
                    <ToolCardView key={i} card={c} />
                  ))}
                </div>
              )}
              <div className='prose prose-sm max-w-none'>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </>
          )}
        </div>

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className='mt-1.5 flex items-center gap-1 text-xs text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          >
            {copied ? <Check className='w-3 h-3' strokeWidth={1.5} /> : <Copy className='w-3 h-3' strokeWidth={1.5} />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}
