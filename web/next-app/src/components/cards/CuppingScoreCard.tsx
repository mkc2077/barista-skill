'use client'

import type { CuppingCardData } from '@/lib/card-parsers'

const MAX_BAR = 10

export function CuppingScoreCard({ data }: { data: CuppingCardData }) {
  const gradeTone = data.isSpecialty
    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
    : 'bg-amber-100 text-amber-700 border-amber-300'

  return (
    <div className="rounded-xl border border-theme-border bg-theme-secondary p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold theme-text">SCA 杯测评分</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${gradeTone}`}>
          {data.grade || '—'}{data.isSpecialty ? ' ★' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        {data.dimensions.map(d => {
          const pct = Math.min(100, (d.score / MAX_BAR) * 100)
          return (
            <div key={d.name}>
              <div className="flex justify-between text-[11px] theme-text mb-0.5">
                <span className="truncate">{d.name}</span>
                <span className="theme-text-dim">{d.score.toFixed(2)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
                <div className="h-full rounded-full bg-theme-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-theme-border">
        <span className="theme-text-dim">
          扣分: 小瑕疵 {data.taintDeduction.toFixed(2)} · 大瑕疵 {data.faultDeduction.toFixed(2)}
        </span>
        <div className="text-right">
          <div className="text-2xl font-bold theme-text leading-none">{data.final.toFixed(2)}</div>
          <div className="text-[10px] theme-text-dim">最终得分 / 100</div>
        </div>
      </div>
    </div>
  )
}
