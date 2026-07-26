'use client'

import { useStore, Theme } from '@/store'

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
  {
    id: 'light-roast',
    name: '浅烘',
    colors: ['#faf6f0', '#6f4e37', '#c9a96e'],
  },
  {
    id: 'pour-over',
    name: '手冲',
    colors: ['#f5f0e8', '#3e2723', '#c9a96e'],
  },
  {
    id: 'dark-roast',
    name: '深烘',
    colors: ['#1a1310', '#c9a96e', '#d4b87e'],
  },
  {
    id: 'espresso',
    name: '浓缩',
    colors: ['#0f0a08', '#d4a574', '#c9a96e'],
  },
]

export function ThemeSwitcher() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  return (
    <div>
      <label className="block text-xs font-medium theme-text-dim mb-2">主题</label>
      <div className="flex gap-2">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
              ${theme === t.id
                ? 'border-theme-accent scale-110 shadow-lg'
                : 'border-theme-border hover:border-theme-primary'
              }`}
          >
            <div className="absolute inset-0 flex">
              {t.colors.map((color, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center
              bg-black/30 text-white py-0.5">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
