'use client'

/**
 * SpotlightCard — react-bits 移植（v7 P3e）
 * 卡片鼠标聚光：onMouseMove 写 --mouse-x/--mouse-y CSS 变量，
 * ::before radial-gradient 跟随鼠标，opacity 0 → 0.5。
 * 纯 CSS + 两个 CSS 变量，零 JS 状态，克制不打扰。
 */

import { useRef, type ReactNode, type MouseEvent } from 'react'

export function SpotlightCard({
  children,
  className = '',
  spotOpacity = 0.5,
}: {
  children: ReactNode
  className?: string
  spotOpacity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spot-opacity', String(spotOpacity))
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
    >
      {children}
    </div>
  )
}