'use client'

interface CvaData {
  total?: number
  old_scale?: number
  dimensions?: { name: string; score: number; weight: number }[]
}

export function CvaScoreCard({ data }: { data: CvaData }) {
  const total = data.total ?? 0
  const oldScale = data.old_scale ?? 0
  const dims = data.dimensions ?? []

  return (
    <div className='coffee-card'>
      <div className='coffee-card-header'>
        <span className='coffee-card-title'>CVA 评分</span>
        <span className='coffee-card-metric'>SCA 新制</span>
      </div>
      <div className='flex items-baseline gap-4 mb-3'>
        <div>
          <span className='font-editorial text-3xl' style={{ color: 'var(--accent)' }}>{total.toFixed(1)}</span>
          <span className='text-xs text-[var(--text-muted)] ml-1'>/ 100 新</span>
        </div>
        <div className='border-l border-[var(--rule)] pl-4'>
          <span className='font-keystroke text-lg text-[var(--text)]'>{oldScale.toFixed(2)}</span>
          <span className='text-xs text-[var(--text-muted)] ml-1'>/ 100 旧</span>
        </div>
      </div>
      {dims.length > 0 && (
        <div className='space-y-1.5'>
          {dims.map((d) => (
            <div key={d.name} className='flex items-center gap-2'>
              <span className='text-xs text-[var(--text-muted)] w-24 shrink-0'>{d.name}</span>
              <div className='flex-1 h-1 rounded-full bg-[var(--surface-inset)] overflow-hidden'>
                <div
                  className='h-full rounded-full'
                  style={{ width: d.score + '%', backgroundColor: 'var(--accent)' }}
                />
              </div>
              <span className='text-xs font-keystroke text-[var(--text)] w-8 text-right'>{d.score}</span>
              <span className='text-[10px] text-[var(--text-faint)] w-6'>x{d.weight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
