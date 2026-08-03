'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { PROVIDERS, fetchModels } from '@/lib/providers'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ThemeSwitcher } from './ThemeSwitcher'
import { X, Download, Upload, ChevronDown, ChevronRight, Save, Check, Search, Loader2 } from 'lucide-react'

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
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm' onClick={() => close(false)} />

      <div className='surface relative w-[92%] max-w-md max-h-[88vh] overflow-y-auto p-6 animate-[fade-in_0.2s_ease_both]'>
        <button onClick={() => close(false)} className='absolute top-4 right-4 btn-icon w-8 h-8' aria-label='Close'>
          <X className='w-4 h-4' strokeWidth={1.5} />
        </button>

        <span className='eyebrow'>API Settings</span>
        <h2 className='font-editorial text-2xl text-[var(--text)] mt-3 mb-5'>配置你的模型</h2>

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
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
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
            <span className='font-keystroke text-[var(--text)]'>{settings.temperature.toFixed(1)}</span>
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
            联网搜索 (AnySearch)
          </label>
          <input
            type='password'
            value={settings.anysearchKey}
            onChange={(e) => update({ anysearchKey: e.target.value })}
            placeholder='AnySearch Key (可选，匿名亦可)'
            className='input mt-2'
          />
          <p className='text-xs text-[var(--text-faint)] mt-1'>Key 仅保存在浏览器；匿名免费</p>
        </div>

        {/* Theme */}
        <div className='mb-4'>
          <ThemeSwitcher />
        </div>

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
          className={
            'btn w-full mt-3 ' +
            (saved ? 'btn-primary' : 'btn-primary')
          }
        >
          {saved ? <Check className='w-4 h-4' strokeWidth={1.5} /> : <Save className='w-4 h-4' strokeWidth={1.5} />}
          {saved ? '已保存' : '保存'}
        </button>
      </div>
    </div>
  )
}
