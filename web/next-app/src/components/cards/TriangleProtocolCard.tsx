'use client'

interface TriangleData {
  difficulty?: string
  cups_per_round?: number
  pass_threshold?: string
  rounds?: number
  description?: string
}

export function TriangleProtocolCard({ data }: { data: TriangleData }) {
  return (
    <div className='coffee-card'>
      <div className='coffee-card-header'>
        <span className='coffee-card-title'>三角杯测协议</span>
        <span className='coffee-card-metric'>{data.difficulty ?? '标准'}</span>
      </div>
      <div className='grid grid-cols-3 gap-3 mb-3'>
        <div>
          <span className='block text-[10px] font-keystroke text-[var(--text-faint)] uppercase tracking-wider'>轮数</span>
          <span className='text-sm font-keystroke text-[var(--text)]'>{data.rounds ?? '--'}</span>
        </div>
        <div>
          <span className='block text-[10px] font-keystroke text-[var(--text-faint)] uppercase tracking-wider'>每轮杯数</span>
          <span className='text-sm font-keystroke text-[var(--text)]'>{data.cups_per_round ?? '--'}</span>
        </div>
        <div>
          <span className='block text-[10px] font-keystroke text-[var(--text-faint)] uppercase tracking-wider'>通过线</span>
          <span className='text-sm font-keystroke text-[var(--text)]'>{data.pass_threshold ?? '--'}</span>
        </div>
      </div>
      {data.description && (
        <p className='text-xs text-[var(--text-muted)] leading-relaxed'>{data.description}</p>
      )}
    </div>
  )
}
