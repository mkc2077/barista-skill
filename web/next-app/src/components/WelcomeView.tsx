'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings, Coffee } from 'lucide-react'

export function WelcomeView() {
  const settings = useStore((s) => s.settings)
  const create = useStore((s) => s.createConversation)
  const openSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const tags = ['14 \u79cd\u51b2\u716e\u6cd5', '11 \u6b3e\u7ecf\u5178\u5976\u996e', '\u745e\u590f\u6392\u6e23', '\u611f\u5b98\u5f15\u5e26', 'RAG \u77e5\u8bc6\u5e93']

  return (
    <div className='flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-16 md:py-24'>
      <div className='w-full max-w-xl mx-auto text-center animate-[fade-in_0.4s_ease_both]'>
        <div className='flex items-center justify-center gap-2 mb-6'>
          <Coffee className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
          <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)]'>
            Barista v6
          </span>
        </div>

        <h1 className='font-editorial text-5xl md:text-6xl mb-5 tracking-tight leading-none text-[var(--text)]'>
          Brew with Intention
        </h1>

        <p className='max-w-md mx-auto text-base text-[var(--text-secondary)] leading-relaxed mb-8'>
          \u987e\u95ee\u5f0f\u5bf9\u8bdd\uff0c\u8ffd\u95ee\u7ec6\u8282\uff0c\u676f\u4e2d\u627e\u5230\u7b54\u6848\u3002
        </p>

        <div className='flex flex-wrap justify-center gap-2 mb-8'>
          {tags.map((tag) => (
            <span key={tag} className='tag'>{tag}</span>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button
            onClick={() => hasApiKey ? create() : openSettings(true)}
            disabled={!hasApiKey}
            className='btn btn-primary px-8 py-3 text-base disabled:cursor-not-allowed'
          >
            <ArrowRight className='w-5 h-5' strokeWidth={1.5} />
            {hasApiKey ? '\u5f00\u59cb\u5bf9\u8bdd' : '\u914d\u7f6e API Key'}
          </button>

          {!hasApiKey && (
            <button onClick={() => openSettings(true)} className='btn btn-secondary px-6 py-3'>
              <Settings className='w-4 h-4' strokeWidth={1.5} />
              \u8bbe\u7f6e
            </button>
          )}
        </div>

        {hasApiKey && (
          <p className='text-[10px] font-keystroke text-[var(--text-faint)] tracking-widest mt-6 uppercase'>
            Ready \u00b7 {(settings.provider ?? '-').toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )
}
