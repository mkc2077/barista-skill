'use client'

import { useEffect, useState } from 'react'

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
      await fetch('/__quit')
    } catch { /* process exiting, ignore network errors */ }
  }

  return (
    <button
      onClick={handleQuit}
      title="固定的本地服务和退出"
      style={{
        position: 'fixed',
        right: 14,
        bottom: 84,
        zIndex: 50,
        fontSize: 11,
        lineHeight: 1.3,
        padding: '5px 10px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--glass-tint)',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        opacity: 0.4,
        boxShadow: 'var(--ambient-shadow)',
        backdropFilter: 'blur(12px)',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
    >
      {quitting ? 'quitted' : 'quit'}
    </button>
  )
}
