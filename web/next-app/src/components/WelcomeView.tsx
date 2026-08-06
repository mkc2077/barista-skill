'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings, Coffee, Sparkles } from 'lucide-react'
import BlurText from './motion/BlurText'
import Magnet from './motion/Magnet'

export function WelcomeView() {
  const settings = useStore((s) => s.settings)
  const create = useStore((s) => s.createConversation)
  const openSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const tags = ['14 种冲煮法', '11 款经典奶咖', '感官引带', 'RAG 知识库']

  return (
    <div className='flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-y-auto scroll-slim'>
      {/* 蒸汽装饰（咖啡杯热气） */}
      <div className='pointer-events-none absolute top-[22%] left-1/2 -translate-x-1/2 w-full max-w-xl h-40 -z-0 hidden md:block' aria-hidden>
        <span className='steam' style={{ left: '38%', bottom: 0, animationDelay: '0s' }} />
        <span className='steam' style={{ left: '50%', bottom: 0, animationDelay: '1.05s' }} />
        <span className='steam' style={{ left: '62%', bottom: 0, animationDelay: '2.1s' }} />
      </div>

      <div className='relative w-full max-w-xl mx-auto text-center view-enter'>
        <div className='flex justify-center mb-4'>
          <div className='glass-thin flex items-center gap-2 px-4 py-1.5 rounded-full'>
            <Coffee className='w-3.5 h-3.5' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <span className='text-[11px] font-keystroke uppercase tracking-widest text-[var(--text-muted)]'>
              Barista · Consultant
            </span>
          </div>
        </div>

        <div className='flex justify-center mb-5'>
          <BlurText
            text='Brew with Intention'
            className='font-editorial text-5xl md:text-6xl tracking-tight leading-none text-[var(--text)] inline-block'
            animateBy='words'
            direction='top'
            delay={120}
            stepDuration={0.3}
          />
        </div>

        <p className='max-w-md mx-auto text-base text-[var(--text-secondary)] leading-relaxed mb-8 text-center t-weight-light'>
          顾问式对话，追问细节，杯中答案。
        </p>

        <div className='flex flex-wrap justify-center gap-2 mb-10'>
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
              <Sparkles className='w-4 h-4' strokeWidth={1.5} />
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

        <p className='mt-10 text-[11px] font-keystroke uppercase tracking-widest text-[var(--text-faint)]'>
          one variable · one sip · one step
        </p>
      </div>
    </div>
  )
}
