'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatView } from '@/components/ChatView'
import { WelcomeView } from '@/components/WelcomeView'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ProfileView } from '@/components/ProfileView'
import { LocalExitButton } from '@/components/LocalExitButton'
import { useStore, useCurrentConversation } from '@/store'
import { AutoSync } from '@/components/AutoSync'

export default function Home() {
  const theme = useStore((s) => s.theme)
  const showSettings = useStore((s) => s.showSettings)
  const viewMode = useStore((s) => s.viewMode)
  const currentModule = useStore((s) => s.settings.currentModule)
  const accentOverride = useStore((s) => s.settings.accentOverride)
  const hasConfig = useStore((s) =>
    Boolean(s.settings.baseUrl && s.settings.model && (s.settings.apiKey || s.settings.provider === 'ollama'))
  )
  const currentConv = useCurrentConversation()

  useEffect(() => {
    document.documentElement.className = 'theme-' + theme
  }, [theme])

  const effectiveAccent = accentOverride === 'auto' ? currentModule : accentOverride

  return (
    <main
      data-module={effectiveAccent}
      className={'theme-' + theme + ' bg-[var(--page)] text-[var(--text)] h-screen flex overflow-hidden'}
    >
      <AutoSync />
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        {viewMode === 'profile'
          ? <ProfileView />
          : (!hasConfig || !currentConv ? <WelcomeView /> : <ChatView />)}
      </div>
      {showSettings && <SettingsPanel />}
      <LocalExitButton />
    </main>
  )
}