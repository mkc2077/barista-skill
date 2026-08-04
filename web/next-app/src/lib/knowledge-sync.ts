/**
 * 知识库自动同步（v7 P1「知识引擎」）
 *
 * 目标：让用户的知识库「定期自己长大」——每隔一段时间自动联网搜索
 * 新配方 / 新冲煮手法 / 冠军方案 / 新豆子，去重后存入本地知识库，
 * 之后自动注入每轮对话（复用 system-prompt 的 knowledge block）。
 *
 * 设计约束（ponytail）：
 *  - 复用 webSearchRaw（AnySearch），不引新依赖；
 *  - 纯函数（isSyncDue / buildNotesFromResults / dedupeNotes）可单测；
 *  - 失败显式收集进 errors，绝不静默（PixelRAG 血泪教训）；
 *  - 自动条目 source 以 "auto: " 前缀标记，可在设置里一键辨认/删除。
 */

import type { AnySearchResult } from './anysearch'
import { webSearchRaw } from './anysearch'
import type { KnowledgeNote, Settings } from '@/store'

/** 默认同步主题（每周轮询，命中「新配方 / 新冲煮手法」需求） */
export const SYNC_TOPICS_DEFAULT: string[] = [
  '咖啡 特调 新配方 创意咖啡',
  '手冲咖啡 新冲煮手法 教程',
  '咖啡 冠军冲煮方案 世界赛',
  '咖啡 新豆子 新产地 新品',
]

export const SYNC_INTERVAL_DAYS_DEFAULT = 7

/** 是否已到自动同步时间（开关 + 间隔 + 上次同步时间） */
export function isSyncDue(s: Settings, now = Date.now()): boolean {
  if (!s.autoSyncOn) return false
  const intervalMs =
    Math.max(1, s.syncIntervalDays || SYNC_INTERVAL_DAYS_DEFAULT) * 86_400_000
  return now - (s.lastSyncAt || 0) >= intervalMs
}

/** 把一次搜索结果转成知识条目（自动条目统一 category=search、source 带 auto: 前缀） */
export function buildNotesFromResults(
  results: AnySearchResult[],
  topic: string,
): KnowledgeNote[] {
  const ts = Date.now()
  return results.map((r, i) => {
    const snip = (r.snippet || r.content || '').trim().slice(0, 300)
    return {
      id: `auto-${ts}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      title: r.title.slice(0, 80),
      text: snip,
      category: 'search',
      createdAt: ts,
      source: `auto: ${r.url}`,
      // topic 暂不落库（KnowledgeNote 无该字段）；如需按主题管理，P2 加字段
    }
  })
}

/** 按来源 URL（无则标题）去重，过滤掉已存在于知识库的条目 */
export function dedupeNotes(
  notes: KnowledgeNote[],
  existing: KnowledgeNote[],
): KnowledgeNote[] {
  const seen = new Set(existing.map((k) => keyOf(k)))
  return notes.filter((n) => !seen.has(keyOf(n)))
}

function keyOf(n: KnowledgeNote): string {
  return (n.source || n.title || '').trim().toLowerCase()
}

export interface SyncOutcome {
  /** 新增（去重后）的条目，调用方负责入库 */
  added: KnowledgeNote[]
  /** 尝试的主题数 */
  topics: number
  /** 失败的查询与原因（显式暴露，不静默降级） */
  errors: string[]
}

/** 跑一轮同步：逐主题搜索 → 去重 → 返回新增条目 */
export async function runKnowledgeSync(
  settings: Settings,
  fetcher: (
    q: string,
    key?: string,
  ) => Promise<{ results: AnySearchResult[] }> = webSearchRaw,
): Promise<SyncOutcome> {
  const topics =
    settings.autoSyncTopics?.length > 0
      ? settings.autoSyncTopics
      : SYNC_TOPICS_DEFAULT
  const collected: KnowledgeNote[] = []
  const errors: string[] = []
  for (const t of topics) {
    try {
      const { results } = await fetcher(t, settings.anysearchKey)
      collected.push(...buildNotesFromResults(results, t))
    } catch (e) {
      errors.push(`${t}: ${(e as Error).message || String(e)}`)
    }
  }
  return {
    added: dedupeNotes(collected, settings.knowledge || []),
    topics: topics.length,
    errors,
  }
}
