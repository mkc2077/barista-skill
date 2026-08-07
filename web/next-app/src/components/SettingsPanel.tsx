'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import type { KnowledgeNote } from '@/store'
import { PROVIDERS, fetchModels } from '@/lib/providers'
import { buildSystemPrompt, DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ThemeSwitcher } from './ThemeSwitcher'
import { runKnowledgeSync, SYNC_INTERVAL_DAYS_DEFAULT, SYNC_TOPICS_DEFAULT } from '@/lib/knowledge-sync'
import { X, Download, Upload, ChevronDown, ChevronRight, Save, Check, Search, Loader2, Plus, Trash2, RefreshCw, BookOpen } from 'lucide-react'

export function SettingsPanel() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const close = useStore((s) => s.setShowSettings)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saved, setSaved] = useState(false)
  const [discovered, setDiscovered] = useState<string[]>([])
  const [discovering, setDiscovering] = useState(false)
  const [importError, setImportError] = useState('')

  const [profileExpanded, setProfileExpanded] = useState(false)
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false)
  const [newBeanName, setNewBeanName] = useState("")
  const [newBeanOrigin, setNewBeanOrigin] = useState("")
  const [newBeanProcess, setNewBeanProcess] = useState("")
  const [newBeanRoast, setNewBeanRoast] = useState("")
  const [newBeanNote, setNewBeanNote] = useState("")
  const [newGrinderName, setNewGrinderName] = useState("")
  const [autoSyncTopicsInput, setAutoSyncTopicsInput] = useState(
    (settings.autoSyncTopics?.length ? settings.autoSyncTopics : SYNC_TOPICS_DEFAULT).join("，")
  )
  const [syncingAuto, setSyncingAuto] = useState(false)
  const profile = settings.profile || ({} as any)

  const addBean = () => {
    if (!newBeanName.trim()) return
    const b = {
      id: "bean-" + Date.now(),
      name: newBeanName.trim(),
      origin: newBeanOrigin.trim() || undefined,
      process: newBeanProcess.trim() || undefined,
      roast: newBeanRoast || undefined,
      note: newBeanNote.trim() || undefined,
    }
    update({ inventoryBeans: [...(settings.inventoryBeans || []), b] })
    setNewBeanName(""); setNewBeanOrigin(""); setNewBeanProcess(""); setNewBeanRoast(""); setNewBeanNote("")
  }
  const removeBean = (id: string) =>
    update({ inventoryBeans: (settings.inventoryBeans || []).filter(b => b.id !== id) })
  const addGrinder = () => {
    if (!newGrinderName.trim()) return
    update({ inventoryGrinders: [...(settings.inventoryGrinders || []), newGrinderName.trim()] })
    setNewGrinderName("")
  }
  const removeGrinder = (i: number) =>
    update({ inventoryGrinders: (settings.inventoryGrinders || []).filter((_, j) => j !== i) })
  const addKnowledge = (n: KnowledgeNote) =>
    update({ knowledge: [...(settings.knowledge || []), n] })
  const removeKnowledge = (id: string) =>
    update({ knowledge: (settings.knowledge || []).filter(k => k.id !== id) })
  // 联网搜索入口已去除：用户自主搜索，偏好靠本地知识库（ChatMessage「收藏配方」可一键入库）

  // v7 P1：立即手动同步一轮（自动更新的手动触发版）
  const handleAutoSyncNow = async () => {
    if (syncingAuto) return
    setSyncingAuto(true)
    try {
      const outcome = await runKnowledgeSync(settings)
      if (outcome.added.length > 0) {
        update({ knowledge: [...(settings.knowledge || []), ...outcome.added] })
      }
      update({ lastSyncAt: Date.now() })
      if (outcome.errors.length > 0) console.warn("[auto-sync manual]", outcome.errors)
    } catch (e) { console.warn("[auto-sync manual]", e) }
    finally { setSyncingAuto(false) }
  }
  const handleAutoSyncTopicsSave = () => {
    const topics = autoSyncTopicsInput.split(/[，,]/).map(t => t.trim()).filter(Boolean)
    update({ autoSyncTopics: topics })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); close(false) }, 800)
  }

  const handleProviderChange = (p: string) => {
    const config = PROVIDERS[p]
    if (config) {
      update({ provider: p, baseUrl: config.baseUrl, model: config.defaultModel })
      setDiscovered([])
    }
  }

  const handleDiscover = async () => {
    if (!settings.baseUrl) return
    setDiscovering(true)
    try {
      const models = await fetchModels(settings.provider, settings.baseUrl, settings.apiKey)
      setDiscovered(models)
    } catch (e) {
      setDiscovered([])
    } finally {
      setDiscovering(false)
    }
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'barista-config-' + new Date().toISOString().slice(0,10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        importData(data)
        setImportError('')
      } catch {
        setImportError('导入失败：格式错误')
      }
    }
    reader.readAsText(file)
  }

  const provider = PROVIDERS[settings.provider] || PROVIDERS.custom
  const availableModels = discovered.length > 0 ? discovered : provider.models
  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0'
        style={{ background: 'color-mix(in oklch, var(--page) 55%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={() => close(false)}
      />

      <div className='conach-panel relative w-full max-w-md max-h-[88vh] overflow-y-auto p-6 animate-[view-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both] scroll-slim text-conach rounded-2xl'>
        <button onClick={() => close(false)} className='absolute top-4 right-4 btn-icon w-8 h-8' aria-label='Close'>
          <X className='w-4 h-4' strokeWidth={1.5} />
        </button>

        <span className='eyebrow'>API Settings</span>
        <h2 className='font-editorial text-2xl text-conach mt-3 mb-5'>配置你的模型</h2>

        {/* v7 P4：未配置时的 3 步快速开始（小白引导，复用下方现有字段） */}
        {!hasApiKey && (
          <div className='mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface-inset)] p-3 space-y-2'>
            <p className='text-xs font-medium text-conach'>快速开始（3 步）</p>
            <ol className='space-y-1.5 text-xs text-[var(--text-secondary)]'>
              <li className='flex items-center gap-1.5'>
                <span className='font-keystroke text-[var(--accent)]'>1</span>
                选择供应商（下方下拉框）
              </li>
              <li className='flex items-center gap-1.5'>
                <span className='font-keystroke text-[var(--accent)]'>2</span>
                填入 API Key 并选择模型
              </li>
              <li className='flex items-center gap-1.5'>
                <span className='font-keystroke text-[var(--accent)]'>3</span>
                <span>（可选）填 AnySearch Key 开启联网搜索与知识库自动更新</span>
              </li>
            </ol>
            <p className='text-[var(--text-faint)] text-xs'>完成后点右上角关闭，即可开始对话。</p>
          </div>
        )}

        {/* Provider */}
        <div className='mb-4'>
          <label className='block text-xs font-medium text-[var(--text-muted)] mb-1.5'>供应商</label>
          <select value={settings.provider} onChange={(e) => handleProviderChange(e.target.value)} className='select'>
            <option value=''>-- 选择 --</option>
            {Object.entries(PROVIDERS).map(([key, p]) => (
              <option key={key} value={key}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* API Key */}
        <div className='mb-4'>
          <label className='block text-xs font-medium text-[var(--text-muted)] mb-1.5'>API Key</label>
          <input
            type='password'
            value={settings.apiKey}
            onChange={(e) => update({ apiKey: e.target.value })}
            placeholder='sk-...'
            className='input'
          />
          <p className='text-xs text-[var(--text-faint)] mt-1'>Key 仅保存在浏览器本地</p>
        </div>

        {/* Base URL */}
        <div className='mb-4'>
          <label className='block text-xs font-medium text-[var(--text-muted)] mb-1.5'>Base URL</label>
          <input
            type='text'
            value={settings.baseUrl}
            onChange={(e) => update({ baseUrl: e.target.value })}
            placeholder='https://api.openai.com/v1'
            className='input'
          />
        </div>

        {/* Model */}
        <div className='mb-4'>
          <label className='block text-xs font-medium text-[var(--text-muted)] mb-1.5'>模型</label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={settings.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder='gpt-4o-mini'
              className='input flex-1'
            />
            <button
              onClick={handleDiscover}
              disabled={discovering || !settings.baseUrl}
              className='btn btn-secondary whitespace-nowrap disabled:cursor-not-allowed'
              data-tooltip='从供应商 API 获取可用模型'
            >
              {discovering ? <Loader2 className='w-4 h-4 animate-spin' /> : <Search className='w-4 h-4' strokeWidth={1.5} />}
            </button>
          </div>

          {availableModels.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-2'>
              {availableModels.slice(0, 8).map(model => (
                <button
                  key={model}
                  onClick={() => update({ model })}
                  className={
                    'px-2.5 py-1 text-xs rounded-full border transition-all ' +
                    (settings.model === model
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-conach'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]')
                  }
                >
                  {model}
                </button>
              ))}
              {availableModels.length > 8 && (
                <span className='px-2.5 py-1 text-xs text-[var(--text-faint)]'>
                  +{availableModels.length - 8} 更多
                </span>
              )}
            </div>
          )}
        </div>

        {/* Temperature */}
        <div className='mb-4'>
          <label className='flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-1.5'>
            <span>Temperature</span>
            <span className='font-keystroke text-conach'>{settings.temperature.toFixed(1)}</span>
          </label>
          <input
            type='range'
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
          />
          <p className='text-xs text-[var(--text-faint)] mt-1'>Higher = more creative, lower = more focused</p>
        </div>

        {/* MCP */}
        <div className='mb-4'>
          <label className='checkbox-label mb-2'>
            <input
              type='checkbox'
              checked={settings.mcpServerOn}
              onChange={(e) => update({ mcpServerOn: e.target.checked })}
            />
            MCP 工具 (需本地服务器)
          </label>
          <input
            type='text'
            value={settings.mcpServerUrl}
            onChange={(e) => update({ mcpServerUrl: e.target.value })}
            placeholder='http://127.0.0.1:8765/mcp'
            className='input mt-2'
          />
          <p className='text-xs text-[var(--text-faint)] mt-1'>26 个咖啡工具。一键启动自动运行</p>
        </div>

        {/* Web Search */}
        <div className='mb-4'>
          <label className='checkbox-label mb-2'>
            <input
              type='checkbox'
              checked={settings.webSearchOn}
              onChange={(e) => update({ webSearchOn: e.target.checked })}
            />
            互联网搜索 (AnySearch)
          </label>
          <input
            type='password'
            value={settings.anysearchKey}
            onChange={(e) => update({ anysearchKey: e.target.value })}
            placeholder="AnySearch Key（可选，匿名亦可）"
            className='input mt-2'
          />
          <p className='text-xs text-[var(--text-faint)] mt-1'>Key 仅保存在浏览器；匿名免费</p>
        </div>

        {/* 「我的画像 & 素材」已迁出 → 整段已删除 */}

        {/* ── 本地知识库 & 联网刷新 ── */}
        <button onClick={() => setKnowledgeExpanded(!knowledgeExpanded)} className='flex items-center gap-1 text-sm text-[var(--accent)] hover:underline mb-3 transition-colors'>
          {knowledgeExpanded ? <ChevronDown className='w-4 h-4' strokeWidth={1.5} /> : <ChevronRight className='w-4 h-4' strokeWidth={1.5} />}
          <BookOpen className='w-4 h-4' strokeWidth={1.5} /> 本地知识库 & 联网刷新
        </button>
        {knowledgeExpanded && (
          <>
            {/* 联网搜索已去除：用户自己搜索，记住偏好靠本地知识库 */}

            <div className='max-h-[240px] overflow-y-auto space-y-1 pr-1'>
              {(settings.knowledge || []).slice().sort((a, b) => b.createdAt - a.createdAt).map(n => (
                <div key={n.id} className='flex flex-col gap-1 text-xs border-t border-[var(--rule)] pt-1.5'>
                  <div className='flex items-start gap-1'>
                    <span className='font-medium text-conach'>{n.title}</span>
                    <span className='text-[var(--text-faint)]'>{n.category}</span>
                    <button onClick={() => removeKnowledge(n.id)} className='btn-icon w-4 h-4 ml-auto'><Trash2 className='w-3 h-3' strokeWidth={1.5} /></button>
                  </div>
                  {n.text && <p className='text-[var(--text-muted)]'>{n.text.slice(0, 150)}</p>}
                  {n.source && <a href={n.source} target='_blank' className='text-[var(--accent)] underline'>来源</a>}
                </div>
              ))}
            </div>

            {/* v7 P1：定期自动更新（知识引擎） */}
            <div className='mt-3 pt-3 border-t border-[var(--rule)] space-y-2'>
              <label className='flex items-center gap-2 text-xs cursor-pointer'>
                <input
                  type='checkbox'
                  checked={!!settings.autoSyncOn}
                  onChange={(e) => update({ autoSyncOn: e.target.checked, lastSyncAt: e.target.checked ? settings.lastSyncAt : 0 })}
                  className='accent-[var(--accent)]'
                />
                <span className='text-conach'>定期自动更新知识库</span>
                <span className='text-[var(--text-faint)]'>
                  {settings.lastSyncAt
                    ? `上次 ${new Date(settings.lastSyncAt).toLocaleDateString()}`
                    : '尚未同步过'}
                </span>
              </label>
              <div className='flex items-center gap-2 text-xs'>
                <span className='text-[var(--text-muted)]'>间隔</span>
                <select
                  value={settings.syncIntervalDays || SYNC_INTERVAL_DAYS_DEFAULT}
                  onChange={(e) => update({ syncIntervalDays: Number(e.target.value) })}
                  className='input text-xs w-20'
                  disabled={!settings.autoSyncOn}
                >
                  <option value={1}>每天</option>
                  <option value={7}>每周</option>
                  <option value={30}>每月</option>
                </select>
                <button onClick={handleAutoSyncNow} disabled={syncingAuto} className='btn btn-secondary text-xs ml-auto shrink-0'>
                  {syncingAuto ? <Loader2 className='w-3.5 h-3.5 animate-spin' strokeWidth={1.5} /> : <RefreshCw className='w-3.5 h-3.5' strokeWidth={1.5} />}
                  <span className='ml-1'>立即同步</span>
                </button>
              </div>
              <div className='flex gap-1'>
                <input
                  type='text'
                  value={autoSyncTopicsInput}
                  onChange={(e) => setAutoSyncTopicsInput(e.target.value)}
                  onBlur={handleAutoSyncTopicsSave}
                  placeholder='同步主题，用逗号分隔'
                  className='input text-xs flex-1'
                  disabled={!settings.autoSyncOn}
                />
                <button onClick={handleAutoSyncTopicsSave} className='btn btn-secondary text-xs shrink-0' disabled={!settings.autoSyncOn}>保存主题</button>
              </div>
              <p className='text-[var(--text-faint)] text-xs'>开启后，应用每次打开时自动检查；新条目以「auto:」前缀标记，可随时删除。</p>
            </div>
          </>
        )}

        {/* 主题/强调色已迁出到「我的资料」模块（占位提示已删除，见 ProfileView） */}

        {/* Advanced */}
        <button onClick={() => setShowAdvanced(!showAdvanced)} className='flex items-center gap-1 text-sm text-[var(--accent)] hover:underline mt-2 transition-colors'>
          {showAdvanced ? <ChevronDown className='w-4 h-4' strokeWidth={1.5} /> : <ChevronRight className='w-4 h-4' strokeWidth={1.5} />}
          高级 (系统提示词)
        </button>
        {showAdvanced && (
          <div className='mt-3'>
            <textarea
              value={settings.systemPrompt || DEFAULT_SYSTEM_PROMPT}
              onChange={(e) => update({ systemPrompt: e.target.value })}
              className='input min-h-[200px] text-xs font-keystroke resize-y'
            />
            <p className='text-xs text-[var(--text-faint)] mt-1'>留空则用默认提示词</p>
          </div>
        )}

        {importError && <p className='text-xs text-red-500 mt-2'>{importError}</p>}

        {/* Export/Import */}
        <div className='flex gap-2 mt-5 pt-4 border-t border-[var(--rule)]'>
          <button onClick={handleExport} className='btn btn-secondary flex-1'>
            <Download className='w-4 h-4' strokeWidth={1.5} />
            导出
          </button>
          <label className='btn btn-secondary flex-1 cursor-pointer'>
            <Upload className='w-4 h-4' strokeWidth={1.5} />
            导入
            <input type='file' accept='.json' onChange={handleImport} className='hidden' />
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saved}
          className='btn w-full mt-3'
          style={{
            background: saved ? 'var(--success)' : 'var(--accent)',
            color: 'var(--text-on-accent)',
          }}
        >
          {saved ? <Check className='w-4 h-4' strokeWidth={1.5} /> : <Save className='w-4 h-4' strokeWidth={1.5} />}
          {saved ? '已保存' : '保存'}
        </button>
      </div>
    </div>
  )
}

/* 材料库相关已迁移到 ProfileView.tsx */
