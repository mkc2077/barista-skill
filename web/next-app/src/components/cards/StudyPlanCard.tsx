'use client'

interface StudyPlanData {
  days?: number
  phase?: string
  daily_tasks?: string[]
  notes?: string
}

export function StudyPlanCard({ data }: { data: StudyPlanData }) {
  return (
    <div className='coffee-card'>
      <div className='coffee-card-header'>
        <span className='coffee-card-title'>备考计划</span>
        <span className='coffee-card-metric'>{data.days ?? '--'} 天 · {data.phase ?? ''}</span>
      </div>
      {data.daily_tasks && data.daily_tasks.length > 0 && (
        <ul className='space-y-1'>
          {data.daily_tasks.map((task, i) => (
            <li key={i} className='flex items-start gap-2 text-xs text-[var(--text-secondary)]'>
              <span className='font-keystroke text-[var(--text-faint)] shrink-0'>{String(i + 1).padStart(2, '0')}</span>
              <span>{task}</span>
            </li>
          ))}
        </ul>
      )}
      {data.notes && (
        <p className='text-xs text-[var(--text-muted)] mt-2 leading-relaxed'>{data.notes}</p>
      )}
    </div>
  )
}
