'use client'

/**
 * Steam — 咖啡蒸汽装饰（纯 CSS 动画，零 JS 循环）。
 * 用于 Welcome / Hero 页面的咖啡杯热气氛围。
 * 3 根蒸汽柱错峰飘升，对应 globals.css 的 .steam 关键帧。
 */

import { type CSSProperties } from 'react'

export function Steam({
  className = '',
  count = 3,
  style,
}: {
  className?: string
  count?: number
  style?: CSSProperties
}) {
  const delays = [0, 1.05, 2.1]
  const lefts = ['38%', '50%', '62%']

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ position: 'absolute', inset: 0, overflow: 'visible', ...style }}
      aria-hidden
    >
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <span
          key={i}
          className='steam'
          style={{
            left: lefts[i % lefts.length],
            bottom: 0,
            animationDelay: `${delays[i % delays.length]}s`,
          }}
        />
      ))}
    </div>
  )
}

export default Steam
