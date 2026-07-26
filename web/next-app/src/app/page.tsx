'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { SettingsModal } from '@/components/SettingsModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { LocalExitButton } from '@/components/LocalExitButton'
import { useStore, useCurrentConversation } from '@/store'

export default function Home() {
  const theme = useStore((s) => s.theme)
  const showSettings = useStore((s) => s.showSettings)
  const settings = useStore((s) => s.settings)
  const currentConversation = useCurrentConversation()

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`
  }, [theme])

  const hasAdapter = settings.baseUrl && settings.model && (settings.apiKey || settings.provider === 'ollama')

  return (
    <main className={`theme-${theme} theme-bg theme-text h-screen flex overflow-hidden`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {!hasAdapter || !currentConversation ? (
          <WelcomeScreen />
        ) : (
          <ChatArea />
        )}
      </div>
      {showSettings && <SettingsModal />}
      <LocalExitButton />
    </main>
  )
}
