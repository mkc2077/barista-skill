'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatView } from '@/components/ChatView'
import { WelcomeView } from '@/components/WelcomeView'
import { SettingsPanel } from '@/components/SettingsPanel'
import { LocalExitButton } from '@/components/LocalExitButton'
import { useStore, useCurrentConversation } from '@/store'

export default function Home() {
  const theme = useStore((s) => s.theme)
  const showSettings = useStore((s) => s.showSettings)
  const hasConfig = useStore((s) =>
    Boolean(s.settings.baseUrl && s.settings.model && (s.settings.apiKey || s.settings.provider === 'ollama'))
  )
  const currentConv = useCurrentConversation()

  useEffect(() => {
    document.documentElement.className = 'theme-' + theme
  }, [theme])

  return (
    <main className={'theme-' + theme + ' bg-[var(--page)] text-[var(--text)] h-screen flex overflow-hidden'}>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        {!hasConfig || !currentConv ? <WelcomeView /> : <ChatView />}
      </div>
      {showSettings && <SettingsPanel />}
      <LocalExitButton />
    </main>
  )
}
