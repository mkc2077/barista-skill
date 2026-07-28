'use client'

import type { StudyPlanCardData } from '@/lib/card-parsers'

export function StudyPlanCard({ data }: { data: StudyPlanCardData }) {
  return (
    <div className="rounded-xl border border-theme-border bg-theme-secondary p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold theme-text">Q-Grader 备考计划</span>
        {data.totalDays > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-theme-hover theme-text-dim">
            {data.totalDays} 天
          </span>
        )}
      </div>
      <div className="space-y-2">
        {data.phases.map((p, i) => (
          <div key={i} className="text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 rounded bg-theme-accent text-white text-[10px] font-medium">
                第 {p.dayStart}-{p.dayEnd} 天
              </span>
              <span className="theme-text font-medium truncate">{p.title}</span>
              <span className="theme-text-dim ml-auto">{p.days}d</span>
            </div>
            {p.items.length > 0 && (
              <ul className="ml-1 space-y-0.5">
                {p.items.slice(0, 3).map((it, j) => (
                  <li key={j} className="theme-text-dim truncate">
                    {it.name}<span className="theme-text-dim"> — {it.desc}</span>
                  </li>
                ))}
                {p.items.length > 3 && (
                  <li className="theme-text-dim italic">+{p.items.length - 3} 项…</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
