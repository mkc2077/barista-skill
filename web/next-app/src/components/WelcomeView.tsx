'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings, Coffee } from 'lucide-react'
import BlurText from './motion/BlurText'
import Magnet from './motion/Magnet'

export function WelcomeView() {
  const settings = useStore((s) => s.settings)
  const create = useStore((s) => s.createConversation)
  const openSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const tags = ['14 种冲煮法', '11 款经典奶咖', '瑞夏排渣', '感官引带', 'RAG 知识库']

  return (
    <div className='flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-16 md:py-24'>
      <div className='w-full max-w-xl mx-auto text-center animate-[fade-in_0.4s_ease_both]'>
        <div className='flex items-center justify-center gap-2 mb-6'>
          <Coffee className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
          <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)]'>
            Barista v7
          </span>
        </div>

        <BlurText
          text='Brew with Intention'
          className='font-editorial text-5xl md:text-6xl mb-5 tracking-tight leading-none text-[var(--text)]'
          animateBy='words'
          direction='top'
          delay={120}
          stepDuration={0.3}
        />

        <p className='max-w-md mx-auto text-base text-[var(--text-secondary)] leading-relaxed mb-8'>
          顾问式对话，追问细节，杯中答案。
        </p>

        <div className='flex flex-wrap justify-center gap-2 mb-8'>
          {tags.map((tag) => (
            <span key={tag} className='tag'>{tag}</span>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
          <Magnet padding={60} magnetStrength={3} disabled={!hasApiKey}>
            <button
              onClick={() => hasApiKey ? create() : openSettings(true)}
              disabled={!hasApiKey}
              className='btn btn-primary px-8 py-3 text-base disabled:cursor-not-allowed'
            >
              <ArrowRight className='w-5 h-5' strokeWidth={1.5} />
              {hasApiKey ? '开始对话' : '配置 API Key'}
            </button>
          </Magnet>

          {!hasApiKey && (
            <button onClick={() => openSettings(true)} className='btn btn-secondary px-6 py-3'>
              <Settings className='w-4 h-4' strokeWidth={1.5} />
              设置
            </button>
          )}
        </div>

        {hasApiKey && (
          <p className='text-[10px] font-keystroke text-[var(--text-faint)] tracking-widest mt-6 uppercase'>
            Ready · {(settings.provider ?? '-').toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )
}
