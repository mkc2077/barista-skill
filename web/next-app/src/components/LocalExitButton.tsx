'use client'

import { useEffect, useState } from 'react'

/**
 * 本地版专属退出按钮。
 *
 * 仅当页面运行在本地启动器上（hostname 为 localhost / 127.0.0.1 / ::1）时才显示。
 * 点击会向 launcher 的同源 `/__quit` 端点发起请求，launcher 收到后关闭本地服务并退出 exe。
 *
 * 这样小白用户无需懂命令行，也不必寻找后台窗口，直接在网页里就能「退出程序」。
 */
export function LocalExitButton() {
  const [visible, setVisible] = useState(false)
  const [quitting, setQuitting] = useState(false)

  useEffect(() => {
    const h = window.location.hostname
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const handleQuit = async () => {
    setQuitting(true)
    try {
      // 同源请求 launcher 的退出端点；launcher 会结束进程，连接可能中断，忽略错误。
      await fetch('/__quit')
    } catch {
      /* 进程即将退出，网络错误可忽略 */
    }
  }

  return (
    <button
      onClick={handleQuit}
      title="关闭本地服务并退出程序"
      style={{
        position: 'fixed',
        right: 14,
        bottom: 80,
        zIndex: 50,
        fontSize: 11,
        lineHeight: 1.3,
        padding: '5px 10px',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.10)',
        background: 'rgba(255,255,255,0.88)',
        color: '#666',
        cursor: 'pointer',
        opacity: 0.4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
    >
      {quitting ? '已退出 ✅' : '⏹ 退出本地'}
    </button>
  )
}
