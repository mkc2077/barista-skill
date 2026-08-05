'use client'

import { useStore, type ThemeMode } from '@/store'

export function ThemeSwitcher() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const modes: { id: ThemeMode; name: string; bg: string }[] = [
    { id: 'light', name: '浅板岩', bg: 'oklch(96.5% 0.005 250)' },
    { id: 'dark', name: '深石墨', bg: 'oklch(14% 0.008 260)' },
  ]

  return (
    <div>
      <label className='block text-xs font-medium text-[var(--text-muted)] mb-2'>主题</label>
      <div className='flex gap-2'>
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setTheme(m.id)}
            title={m.name}
            className={
              'relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 ' +
              (theme === m.id
                ? 'border-[var(--accent)] scale-105 shadow-md'
                : 'border-[var(--border)] hover:border-[var(--border-strong)]')
            }
          >
            <div className='absolute inset-0' style={{ backgroundColor: m.bg }} />
            <span className='absolute bottom-0 left-0 right-0 text-[8px] text-center text-black/60 bg-white/50 py-0.5'>
              {m.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
