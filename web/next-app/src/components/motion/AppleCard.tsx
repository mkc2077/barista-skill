'use client'

/**
 * AppleCard — 苹果味按压缩放卡片（react-bits PressableCard 移植，极简版）。
 * hover 微浮 + 微光边框；按下时 iOS 式 scale 0.98。
 * 纯 CSS + 极少 JS 状态，符合 DESIGN.md「克制」原则。
 */

import { useRef, type ReactNode, type MouseEvent } from 'react'

export function AppleCard({
  children,
  className = '',
  onClick,
  glow = true,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  glow?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!glow) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`apple-card spotlight-card ${className}`}
    >
      {children}
    </div>
  )
}

export default AppleCard
