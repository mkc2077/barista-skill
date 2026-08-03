'use client'

interface CuppingScoreData {
  total?: number
  dimensions?: Record<string, number>
  grade?: string
}

export function CuppingScoreCard({ data }: { data: CuppingScoreData }) {
  const total = data.total ?? 0
  const grade = data.grade ?? (total >= 85 ? '精品' : total >= 80 ? '优秀' : '商业')
  const dims = data.dimensions ?? {}

  return (
    <div className='coffee-card'>
      <div className='coffee-card-header'>
        <span className='coffee-card-title'>杯测评分</span>
        <span className='coffee-card-metric'>SCA · {grade}</span>
      </div>
      <div className='flex items-baseline gap-3 mb-3'>
        <span className='font-editorial text-3xl' style={{ color: 'var(--accent)' }}>{total.toFixed(2)}</span>
        <span className='text-xs text-[var(--text-muted)]'>/ 100</span>
      </div>
      {Object.keys(dims).length > 0 && (
        <div className='space-y-1'>
          {Object.entries(dims).map(([key, val]) => (
            <div key={key} className='flex items-center gap-2'>
              <span className='text-xs text-[var(--text-muted)] w-20 shrink-0'>{key}</span>
              <div className='flex-1 h-1 rounded-full bg-[var(--surface-inset)] overflow-hidden'>
                <div
                  className='h-full rounded-full transition-all duration-500'
                  style={{ width: (val as number * 10) + '%', backgroundColor: 'var(--accent)' }}
                />
              </div>
              <span className='text-xs font-keystroke text-[var(--text)] w-8 text-right'>{val as number}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
