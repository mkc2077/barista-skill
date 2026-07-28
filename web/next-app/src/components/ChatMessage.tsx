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
  const isError = message.role === 'assistant' && message.content.startsWith('⚠')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const avatar = isUser ? '🧑' : isError ? '⚠️' : '☕'

  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full animate-msg-in">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0
        bg-theme-accent">
        {avatar}
      </div>
      <div className="flex-1 group">
        <div
          className={`px-4 py-3 rounded-xl text-sm leading-relaxed
            ${isUser
              ? 'bg-theme-primary text-white rounded-tr-sm'
              : isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
              : 'bg-theme-secondary border border-theme-border rounded-tl-sm'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              {message.cards && message.cards.length > 0 && (
                <div className="mb-2 space-y-2">
                  {message.cards.map((c, i) => (
                    <ToolCardView key={i} card={c} />
                  ))}
                </div>
              )}
              <div className="prose prose-sm max-w-none theme-text">
                <ReactMarkdown>{message.content}</ReactMarkdown>
</div>
            </>
          )}
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 text-xs theme-text-dim
              opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}
