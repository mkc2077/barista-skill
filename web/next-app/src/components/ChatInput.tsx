'use client'

import { useState, useRef, useCallback } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { getAdapter } from '@/lib/llm-adapter'
import { chatWithMCP } from '@/lib/mcp-client'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { webSearch } from '@/lib/anysearch'
import { CARD_PARSERS } from '@/lib/card-parsers'
import type { ToolCard } from '@/store'
import { Send, Square, Image as ImageIcon, X } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const [images, setImages] = useState<string[]>([]);
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

  const getSystemPrompt = () => buildSystemPrompt(settings)

  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) addImageFromFile(file);
      }
    }
  }, []);

  const addImageFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback((idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

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
    setImages([])


    addMessage(convId, { role: 'user', content: text, images: images.length > 0 ? [...images] : undefined })

    const history = useStore.getState().conversations.find(c => c.id === convId)?.messages || []
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content, ...(m.images && m.images.length ? { images: m.images } : {}) })),
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
    <div className='px-4 py-3 relative'>
      <div className='absolute inset-0 pointer-events-none' style={{
        background: 'var(--glass-bg)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        backdropFilter: 'blur(20px) saturate(1.8)',
      }} />
      <div className='relative max-w-3xl mx-auto'>
        {images.length > 0 && (
          <div className='flex gap-2 mb-2 flex-wrap'>
            {images.map((img, i) => (
              <div key={i} className='relative group'>
                <img src={img} className='h-16 w-auto rounded-xl object-cover border border-[var(--border)]' />
                <button onClick={() => removeImage(i)} className='absolute -top-1.5 -right-1.5 btn-icon w-5 h-5 rounded-full bg-[var(--surface)] shadow-sm opacity-0 group-hover:opacity-100'>
                  <X className='w-2.5 h-2.5' strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className='flex items-end gap-1.5 surface-inset px-2 py-1.5 rounded-[20px] focus-within:shadow-[0_0_0_3px_var(--accent-ring)] transition-shadow duration-200'>
          <label className='btn-icon cursor-pointer shrink-0' data-tooltip='Upload image'>
            <input type='file' accept='image/*' className='hidden' onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addImageFromFile(file);
              e.target.value = '';
            }} />
            <ImageIcon className='w-4 h-4' strokeWidth={1.5} />
          </label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder='输入消息... (Enter 发送 / Shift+Enter 换行)'
            onPaste={handlePaste}
            className='flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[120px] py-1 placeholder:opacity-50'
          />
          <button
            onClick={handleSend}
            className='shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white font-medium text-sm transition-all duration-150'
            style={{
              background: 'var(--accent)',
              boxShadow: 'inset 0 1px 0 0 color-mix(in oklch, white 22%, transparent), inset 0 -1px 0 0 color-mix(in oklch, black 14%, transparent), var(--shadow-sm)',
            }}
            aria-label={streaming ? 'Stop' : 'Send'}
          >
            {streaming ? <Square className='w-3.5 h-3.5' strokeWidth={1.5} /> : <Send className='w-3.5 h-3.5' strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  )
}
