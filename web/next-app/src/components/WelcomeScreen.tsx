'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings } from 'lucide-react'

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

  const tags = ['14 种冲煮法', '11 款经典奶咖', '瑕疵排查', '感官引带', '三档自适应']

  return (
    <div className="aurora-bg flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-12 px-6 sm:px-10 md:px-16 lg:px-24 py-16 md:py-20">
      {/* Left: editorial display column (asymmetric, soft-skill / redesign-skill anti-default) */}
      <div
        className="md:col-span-7 flex flex-col justify-center relative z-[1] animate-stagger"
        style={{ animationDelay: '0ms' }}
      >
        <span className="eyebrow w-fit">COFFEE CONSULTANT</span>

        <h1 className="display-hero theme-primary mt-7 mb-6">
          Barista<br />咖啡顾问
        </h1>

        <p className="theme-text-dim text-base md:text-lg max-w-md mb-2 leading-relaxed">
          顾问式追问，穿透表象——找到影响杯中风味的那个关键变量。
        </p>
        <p className="theme-text-dim text-sm max-w-md mb-10 font-keystroke tracking-wide">
          不是被动问答。先问透，再动手。
        </p>

        <div className="flex flex-wrap gap-2 max-w-xl">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bezel-shell-sm px-3 py-1 rounded-full text-xs theme-text-dim hover:border-theme-accent transition-colors duration-300 ease-editorial"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right: glass start tray with star-border accent */}
      <div
        className="md:col-span-5 flex items-center justify-center md:justify-end relative z-[1] animate-stagger"
        style={{ animationDelay: '220ms' }}
      >
        <div className="glass-panel w-full max-w-sm p-6 md:p-7">
          <div className="flex items-center justify-between mb-1">
            <span className="eyebrow">BEGIN</span>
            <span className="font-keystroke text-[0.625rem] theme-text-dim tracking-widest">
              25 TOOLS · RAG
            </span>
          </div>

          <h2 className="font-editorial text-2xl theme-primary mt-4 mb-2 leading-tight">
            准备好开始了吗？
          </h2>
          <p className="theme-text-dim text-sm mb-7 leading-relaxed">
            填好你的模型 API 即可对话。也支持联网搜索与本地咖啡知识库的语义检索。
          </p>

          {/* CTA with star-border accent ring */}
          <div className="star-border rounded-[1rem] mb-3">
            <button
              onClick={handleStart}
              disabled={!hasApiKey}
              className="group relative z-[1] w-full flex items-center justify-center gap-2.5 px-6 py-3.5
                bg-theme-primary text-white rounded-[0.9rem] font-medium text-sm
                press-physics disabled:opacity-40 disabled:cursor-not-allowed
                transition-transform ease-spring"
            >
              <span>开始对话</span>
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform ease-spring"
                strokeWidth={1.5}
              />
            </button>
          </div>

          {!hasApiKey ? (
            <button
              onClick={() => setShowSettings(true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs theme-text-dim
                hover:text-theme-primary transition-colors ease-editorial
                border-t border-theme-border pt-4"
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
              请先配置你的 API Key
            </button>
          ) : (
            <p className="mt-2 text-center text-[0.625rem] font-keystroke tracking-widest theme-text-dim border-t border-theme-border pt-4">
              READY · {(settings.provider ?? '—').toUpperCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
