'use client'

/**
 * Dock — macOS 风格磁悬浮（v7 P3e.1，react-bits Dock 移植，极简版）
 *
 * 克制原则：不做逐帧鼠标追踪（成本高、易打扰），用纯 CSS 两级缩放：
 *   - 容器 hover → 所有项 scale(maxScale)（整体凸起）
 *   - 当前 hover 项 → 再放大 1.12 档（Dock 的"当前项最大"感）
 * transform-origin 底部居中 + 自定贝塞尔，有磁悬浮味且零 JS 状态。
 */

import type { ReactNode } from 'react'

export function Dock({
  children,
  maxScale = 1.18,
  className = '',
}: {
  children: ReactNode
  maxScale?: number
  className?: string
}) {
  return (
    <div
      className={`dock-root ${className}`}
      style={{
        ['--dock-max-scale' as string]: String(maxScale),
        position: 'relative',
      }}
    >
      {children}
    </div>
  )
}

export function DockItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`dock-item ${className}`}
      style={{
        transform: 'scale(var(--dock-item-scale, 1))',
        transition: 'transform 0.25s var(--ease-out-soft, cubic-bezier(0.32,0.72,0,1))',
        transformOrigin: 'center bottom',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}