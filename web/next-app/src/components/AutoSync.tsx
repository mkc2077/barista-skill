'use client'

/**
 * 知识库自动同步（v7 P1）——挂载在页面根部，应用启动时检查一次：
 * 若开了「自动更新」且已过间隔，后台跑一轮同步并入库。
 * 静默失败（console.warn），不打断首屏（搜索是异步网络请求）。
 */

import { useEffect, useRef } from 'react'
import { useStore } from '@/store'
import { isSyncDue, runKnowledgeSync } from '@/lib/knowledge-sync'

export function AutoSync() {
  const ran = useRef(false)
  const settings = useStore((s) => s.settings)
  const addKnowledgeNotes = useStore((s) => s.addKnowledgeNotes)
  const updateSettings = useStore((s) => s.updateSettings)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!isSyncDue(settings)) return
    ;(async () => {
      const outcome = await runKnowledgeSync(settings)
      if (outcome.added.length > 0) addKnowledgeNotes(outcome.added)
      if (outcome.errors.length > 0) {
        console.warn('[auto-sync] 部分主题同步失败:', outcome.errors)
      }
      updateSettings({ lastSyncAt: Date.now() })
    })()
  }, [settings, addKnowledgeNotes, updateSettings])

  return null
}
