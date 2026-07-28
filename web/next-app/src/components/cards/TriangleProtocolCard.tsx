'use client'

import type { TriangleCardData } from '@/lib/card-parsers'

export function TriangleProtocolCard({ data }: { data: TriangleCardData }) {
  return (
    <div className="rounded-xl border border-theme-border bg-theme-secondary p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold theme-text">三角杯测协议</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-theme-hover theme-text-dim">
          {data.difficulty || '—'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="text-center rounded-lg bg-theme-hover py-2">
          <div className="text-xl font-bold theme-text">{data.rounds}</div>
          <div className="text-[10px] theme-text-dim">轮数</div>
        </div>
        <div className="text-center rounded-lg bg-theme-hover py-2">
          <div className="text-xl font-bold theme-text">{data.totalCups}</div>
          <div className="text-[10px] theme-text-dim">总杯数</div>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-[11px] theme-text-dim">
        <div className="flex justify-between">
          <span>每轮杯数</span><span className="theme-text">{data.cupsPerRound}（1 异 + {data.sameCount} 同）</span>
        </div>
        <div className="flex justify-between">
          <span>通过线</span><span className="theme-text">{data.passThreshold}</span>
        </div>
      </div>
      {data.difficultyProgression && (
        <div className="mt-2 pt-2 border-t border-theme-border text-[11px] theme-text-dim">
          {data.difficultyProgression}
        </div>
      )}
    </div>
  )
}
