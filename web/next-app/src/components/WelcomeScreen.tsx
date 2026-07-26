'use client'

import { useStore } from '@/store'
import { Coffee, Settings } from 'lucide-react'

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-6xl mb-4">☕</div>
      <h1 className="text-2xl font-bold theme-primary mb-3">Barista 咖啡顾问</h1>
      <p className="theme-text-dim text-center mb-2">
        你的专属咖啡顾问——不是被动问答，是顾问主导穿透追问
      </p>
      <p className="theme-text-dim text-center mb-6 text-sm">
        通过连续追问帮你找到影响口感的那个关键变量
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-8">
        {['14 种冲煮法', '11 款经典奶咖', '故障排查', '感官引导', '新手/进阶/资深三档'].map(tag => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-theme-secondary border border-theme-border rounded-full text-sm theme-text-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!hasApiKey}
        className="flex items-center gap-2 px-8 py-3 bg-theme-primary text-white rounded-xl
          font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg"
      >
        <Coffee className="w-5 h-5" />
        开始对话
      </button>

      {!hasApiKey && (
        <button
          onClick={() => setShowSettings(true)}
          className="mt-4 flex items-center gap-1.5 text-sm theme-text-dim hover:theme-primary transition-colors"
        >
          <Settings className="w-4 h-4" />
          请先点击设置 API
        </button>
      )}
    </div>
  )
}
