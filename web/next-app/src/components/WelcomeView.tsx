'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings, Sparkles } from 'lucide-react'
import Magnet from './motion/Magnet'

export function WelcomeView() {
  const settings = useStore((s) => s.settings)
  const create = useStore((s) => s.createConversation)
  const openSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const tags = ['14 冲煮法', '11 经典奶咖', '感官引带', '本地知识库']

  return (
    <div className='flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-y-auto scroll-slim relative'>
      {/* \u5370\u8c61\u6d3e haze \u80cc\u666f\u5728\u4e3b\u9898 hue \u4e0a */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center' aria-hidden>
        <div
          className='w-[800px] h-[800px] opacity-50'
          style={{ filter: 'url(#conach-turb)', color: 'var(--accent)' }}
        >
          <svg viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice' width='100%' height='100%'>
            <defs>
              <filter id='conach-turb' x='0%' y='0%' width='100%' height='100%'>
                <feTurbulence type='fractalNoise' baseFrequency='0.012 0.018' numOctaves='3' seed={3} />
                <feDisplacementMap in='SourceGraphic' scale={32} />
              </filter>
              <radialGradient id='welcome-haze' cx='50%' cy='40%' r='65%'>
                <stop offset='0%' stopColor='currentColor' stopOpacity='0.40' />
                <stop offset='60%' stopColor='currentColor' stopOpacity='0.15' />
                <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
              </radialGradient>
            </defs>
            <rect width='800' height='800' fill='url(#welcome-haze)' />
            <ellipse cx='320' cy='340' rx='240' ry='140' fill='currentColor' opacity='0.10' />
            <ellipse cx='540' cy='460' rx='280' ry='160' fill='currentColor' opacity='0.08' />
          </svg>
        </div>
      </div>

      <div className='relative w-full max-w-2xl mx-auto text-center view-enter'>
        {/* \u9876\u90e8\u5706\u73af logo \u9ad8\u7ea7\u5f00\u573a */}
        <div className='flex flex-col items-center mb-8'>
          <svg width='64' height='64' viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='1' className='text-conach mb-3' style={{ opacity: 0.78 }}>
            <circle cx='32' cy='32' r='28' />
            <circle cx='32' cy='32' r='18' />
            <circle cx='32' cy='32' r='6' fill='currentColor' />
          </svg>
          <span className='font-hero-eyebrow text-conach-soft' style={{ letterSpacing: '0.32em' }}>
            Barista \u00b7 Coffee Consultant
          </span>
        </div>

        {/* \u5927\u5199 tracked \u6807\u9898 */}
        <h1 className='font-hero-display text-conach mb-4'>
          Brew with Intention
        </h1>

        {/* \u4e2d\u6587\u88c5\u9970\u526f\u6807\u9898 */}
        <p className='font-hero-cn mb-2 max-w-md mx-auto'>
          \u987e\u95ee\u5f0f\u5bf9\u8bdd\uff0c\u8ffd\u95ee\u7ec6\u8282\uff0c\u676f\u4e2d\u7b54\u6848\u3002
        </p>

        <p className='text-xs text-conach-faint mb-10 font-hero-eyebrow' style={{ letterSpacing: '0.28em' }}>
          ONE VARIABLE \u00b7 ONE SLIP \u00b7 ONE STEP
        </p>

        {/* \u80fd\u529b chips */}
        <div className='flex flex-wrap justify-center gap-2 mb-10'>
          {tags.map((tag) => (
            <span
              key={tag}
              className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-hero-eyebrow'
              style={{
                letterSpacing: '0.18em',
                background: 'rgba(245,243,238,0.04)',
                border: '1px solid rgba(245,243,238,0.14)',
                color: 'rgba(245,243,238,0.72)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* \u4e3b CTA */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-8'>
          <Magnet padding={60} magnetStrength={3} disabled={!hasApiKey} wrapperClassName='inline-block'>
            <button
              onClick={() => hasApiKey ? create() : openSettings(true)}
              disabled={!hasApiKey}
              className='conach-pill-btn !text-xs !px-7 !py-3 disabled:cursor-not-allowed disabled:opacity-50'
              style={{
                background: 'color-mix(in oklch, var(--accent) 24%, transparent)',
                borderColor: 'color-mix(in oklch, var(--accent) 60%, transparent)',
                color: 'rgba(245,243,238,0.95)',
                letterSpacing: '0.24em',
              }}
            >
              <Sparkles className='w-3.5 h-3.5' strokeWidth={1.5} />
              {hasApiKey ? 'Start Session' : 'Configure API Key'}
            </button>
          </Magnet>

          {!hasApiKey && (
            <button onClick={() => openSettings(true)} className='conach-pill-btn'>
              <Settings className='w-3.5 h-3.5' strokeWidth={1.5} />
              Settings
            </button>
          )}
        </div>

        {/* \u5e95\u90e8 hairline + \u7f16\u53f7 */}
        <div className='flex items-center gap-4 max-w-sm mx-auto mt-12'>
          <div className='conach-hair flex-1' />
          <span className='font-hero-eyebrow text-conach-faint' style={{ letterSpacing: '0.4em' }}>
            Barista \u00b7 No.00
          </span>
          <div className='conach-hair flex-1' />
        </div>
      </div>
    </div>
  )
}