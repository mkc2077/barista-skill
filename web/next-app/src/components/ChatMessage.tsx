'use client'

import { useState } from 'react'
import { Copy, Check, BookmarkPlus, BookmarkCheck } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useStore, type Message } from '@/store'
import { ToolCardView } from './cards'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const addKnowledgeNotes = useStore((s) => s.addKnowledgeNotes)
  const isUser = message.role === 'user'
  const isError = message.role === 'assistant' && message.content.startsWith('\u26a0')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // v7 P3d.1：收藏配方到本地知识库（整条助手回复作为 KnowledgeNote，category='recipe'）
  const handleSaveRecipe = () => {
    const text = message.content.trim()
    if (!text || saved) return
    const title = text.split('\n')[0].slice(0, 40) || '来自对话的配方'
    addKnowledgeNotes([{
      id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.replace(/^[#*\s]+/, '').slice(0, 40),
      text,
      category: 'recipe',
      createdAt: Date.now(),
      source: '来自对话收藏',
    }])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
            <div className="space-y-2">
              {message.images && message.images.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-1">
                  {message.images.map((img, i) => (
                    <img key={i} src={img} className="h-32 w-auto rounded-lg object-cover border border-[var(--border)]" />
                  ))}
                </div>
              )}
              {message.content && <p className='whitespace-pre-wrap'>{message.content}</p>}
            </div>
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
          <div className='mt-1.5 flex items-center gap-3 text-xs text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            <button onClick={handleCopy} className='flex items-center gap-1 hover:text-[var(--text-secondary)]'>
              {copied ? <Check className='w-3 h-3' strokeWidth={1.5} /> : <Copy className='w-3 h-3' strokeWidth={1.5} />}
              {copied ? '已复制' : '复制'}
            </button>
            <button
              onClick={handleSaveRecipe}
              className='flex items-center gap-1 hover:text-[var(--accent)]'
              title='保存为本地配方（进入 Settings → 本地知识库查看）'
            >
              {saved ? <BookmarkCheck className='w-3 h-3' strokeWidth={1.5} /> : <BookmarkPlus className='w-3 h-3' strokeWidth={1.5} />}
              {saved ? '已保存配方' : '收藏配方'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
