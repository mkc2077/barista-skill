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

  const monogram = isUser ? 'U' : isError ? '!' : 'C'

  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full animate-msg-in">
      <div className="flex-shrink-0 mt-0.5">
        <div className="-sm bg-transparent">
          <div
            className={`bezel-core-sm w-8 h-8 flex items-center justify-center text-xs font-medium
${isUser
                ? 'bg-theme-primary text-white'
                : isError
                ? 'bg-theme-danger text-white'
                : 'bg-theme-accent text-white'}`}
          >
            {monogram}
          </div>
        </div>
      </div>

      <div className="flex-1 group min-w-0">
        <div className={isUser ? '' : ''}>
          <div
            className={`px-4 py-3 text-sm leading-relaxed
${isUser
                ? '-sm bg-theme-primary text-white rounded-lg'
                : isError
                ? 'bg-theme-danger/10 text-theme-danger border border-theme-danger/30'
                : 'bg-theme-secondary'}`}
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
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1.5 flex items-center gap-1 text-xs theme-text-dim
              opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-spring"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" strokeWidth={1.5} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}
