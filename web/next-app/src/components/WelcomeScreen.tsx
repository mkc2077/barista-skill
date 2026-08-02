'use client'

import { useStore } from '@/store'
import { ArrowRight, Settings, Coffee } from 'lucide-react'

export function WelcomeScreen() {
  const settings = useStore((s) => s.settings)
  const createConversation = useStore((s) => s.createConversation)
  const setShowSettings = useStore((s) => s.setShowSettings)

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const tags = ['14 种冲煮法', '11 款经典奶咖', '瑕疵排查', '感官引带', 'RAG 知识库']

  return (
    <div className="aurora-bg flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-8 py-16 md:py-24">
      <div className="relative z-10 w-full max-w-xl mx-auto text-center animate-in">
        <span className="eyebrow mb-6 block">
          <Coffee className="w-3 h-3 inline mr-1" /> BARISTA v5
        </span>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-editorial mb-6 tracking-tight leading-none">
          Brew with Intention
        </h1>

        <p className="max-w-md mx-auto text-base md:text-lg theme-text-dim leading-relaxed mb-8">
          顾问式对话，追问细节，杯中找到答案。
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tags.map((tag) => (
            <span key={tag} className="tag-sm">{tag}</span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => hasApiKey ? createConversation() : setShowSettings(true)}
            disabled={!hasApiKey}
            className="btn-primary px-8 py-3 rounded-xl text-lg press-physics disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            {hasApiKey ? '开始对话' : '配置 API Key'}
          </button>

          {!hasApiKey && (
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary px-6 py-3 rounded-xl press-physics"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              设置
            </button>
          )}
        </div>

        {hasApiKey && (
          <p className="text-[0.6rem] font-keystroke theme-text-dim tracking-widest mt-6">
            READY · {(settings.provider ?? '-').toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )
}
