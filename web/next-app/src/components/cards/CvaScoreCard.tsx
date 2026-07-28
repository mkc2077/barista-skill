'use client'

import type { CvaCardData } from '@/lib/card-parsers'

// 1-9 affective scale mapped onto a 0-100 bar for visual width.
export function CvaScoreCard({ data }: { data: CvaCardData }) {
  const pct = Math.min(100, (data.affective / 9) * 100)
  const legacyPct = Math.min(100, data.legacy100)
  const bandTone = data.isSpecialty
    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
    : 'bg-amber-100 text-amber-700 border-amber-300'
  return (
    <div className="rounded-xl border border-theme-border bg-theme-secondary p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold theme-text">CVA 情感评估</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${bandTone}`}>
          {data.band || '—'}{data.isSpecialty ? ' ★' : ''}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[11px] theme-text mb-0.5">
            <span>情感总分 (1-9)</span>
            <span className="theme-text-dim">{data.affective.toFixed(2)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
            <div className="h-full rounded-full bg-theme-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] theme-text mb-0.5">
            <span>旧 100 分制对照</span>
            <span className="theme-text-dim">{data.legacy100.toFixed(2)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${legacyPct}%` }} />
          </div>
        </div>
      </div>
      {(data.descriptiveRichness != null || data.extrinsic != null) && (
        <div className="flex gap-4 mt-2 pt-2 border-t border-theme-border text-[11px] theme-text-dim">
          {data.descriptiveRichness != null && <span>描述性 {data.descriptiveRichness.toFixed(1)} / 15</span>}
          {data.extrinsic != null && <span>外在属性 {data.extrinsic.toFixed(1)} / 100</span>}
        </div>
      )}
    </div>
  )
}
