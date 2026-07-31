'use client'

import { useStore } from '@/store'
import { Settings } from 'lucide-react'

export function WelcomeScreen() {
  const settings = useStore((s) => s.settings)
  const createConversation = useStore((s) => s.createConversation)
  const setShowSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const handleStart = () => {
    if (hasApiKey) {
      createConversation()
    } else {
      setShowSettings(true)
    }
  }

  const tags = ['14 种冲煮法', '11 款经典奶坊', '故障排查', '感官引导', '三档自适应']

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-24">
      <span className="eyebrow animate-stagger" style={{ animationDelay: '0ms' }}>
        Coffee Consultant · 双语 · 顾问主导
      </span>

      <h1
        className="font-editorial text-5xl md:text-6xl theme-primary mt-6 mb-3 animate-stagger"
        style={{ animationDelay: '80ms' }}
      >
        Barista 咖啡顾问
      </h1>

      <p
        className="theme-text-dim text-center text-base max-w-md mb-1 animate-stagger"
        style={{ animationDelay: '160ms' }}
      >
        顾问主导穿透追问，找到影响口感的那一个变量
      </p>
      <p
        className="theme-text-dim text-center text-sm max-w-md mb-10 animate-stagger"
        style={{ animationDelay: '220ms' }}
      >
        不是被动问答，是顾问先问你
      </p>

      <div
        className="flex flex-wrap gap-2 justify-center max-w-lg mb-12 animate-stagger"
        style={{ animationDelay: '300ms' }}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs theme-text-dim
              border border-theme-border bg-theme-secondary/60"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Double-Bezel CTA: outer machined tray holds a pill button with nested icon circle */}
      <div className="bezel-shell animate-stagger" style={{ animationDelay: '380ms' }}>
        <button
          onClick={handleStart}
          disabled={!hasApiKey}
          className="group w-full flex items-center justify-center gap-3 px-6 py-3.5
            bg-theme-primary text-white rounded-[1.125rem] font-medium text-sm
            press-physics disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>开始对话</span>
          <span
            className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center
              group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105
              transition-transform ease-spring"
            style={{ transitionDuration: '0.4s' }}
          >
            <span className="text-sm leading-none">↑</span>
          </span>
        </button>
      </div>

      {!hasApiKey && (
        <button
          onClick={() => setShowSettings(true)}
          className="mt-8 flex items-center gap-1.5 text-xs theme-text-dim
            hover:text-theme-primary transition-colors ease-editorial animate-stagger"
          style={{ animationDelay: '460ms' }}
        >
          <Settings className="w-3.5 h-3.5" />
          请先点击设置 API
        </button>
      )}
    </div>
  )
}
