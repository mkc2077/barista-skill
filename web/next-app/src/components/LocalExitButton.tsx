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
        bottom: 14,
        zIndex: 9999,
        fontSize: 12,
        lineHeight: 1.4,
        padding: '7px 12px',
        borderRadius: 10,
        border: '1px solid rgba(0,0,0,0.12)',
        background: 'rgba(255,255,255,0.92)',
        color: '#555',
        cursor: 'pointer',
        opacity: 0.55,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.55')}
    >
      {quitting ? '已退出，可关闭窗口 ✅' : '⏹ 退出本地服务'}
    </button>
  )
}
