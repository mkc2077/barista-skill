'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/store'
import { PROVIDERS } from '@/lib/providers'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ModelSelector } from './ModelSelector'
import { ThemeSwitcher } from './ThemeSwitcher'
import { X, Download, Upload, ChevronDown, ChevronRight, Save, Check } from 'lucide-react'

export function SettingsModal() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const setShowSettings = useStore((s) => s.setShowSettings)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    // zustand persist 已自动写入 localStorage；Save 按钮提供显式反馈
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowSettings(false)
    }, 800)
  }

  const handleProviderChange = (provider: string) => {
    const p = PROVIDERS[provider]
    if (p) {
      updateSettings({
        provider,
        baseUrl: p.baseUrl,
        model: p.defaultModel,
      })
    }
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barista-chat-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        importData(data)
        alert('导入成功')
      } catch {
        alert('导入失败：数据格式不正确')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowSettings(false)}
      />

      <div className="relative bg-theme-secondary rounded-2xl shadow-2xl w-[90%] max-w-md max-h-[90vh]
        overflow-y-auto p-6 animate-msg-in">
        <button
          onClick={() => setShowSettings(false)}
          className="absolute top-4 right-4 p-1 hover:bg-theme-hover rounded transition-colors"
        >
          <X className="w-5 h-5 theme-text-dim" />
        </button>

        <h2 className="text-lg font-bold theme-primary mb-5">API 设置</h2>

        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">API 供应商</label>
          <select
            value={settings.provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          >
            <option value="">— 请选择 —</option>
            {Object.entries(PROVIDERS).map(([key, p]) => (
              <option key={key} value={key}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">API Key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            placeholder="sk-..."
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          <p className="text-xs theme-text-dim mt-1">密钥仅保存在本地浏览器，不会上传</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">Base URL</label>
          <input
            type="text"
            value={settings.baseUrl}
            onChange={(e) => updateSettings({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
        </div>

        <div className="mb-4">
          <ModelSelector />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">
            温度 <span className="theme-primary font-bold">{settings.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs theme-text-dim mt-1">越高越有创意，越低越稳定。推荐 0.6-0.8</p>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.mcpEnabled}
              onChange={(e) => updateSettings({ mcpEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            启用 MCP 工具（需本地运行 MCP Server）
          </label>
          <input
            type="text"
            value={settings.mcpUrl}
            onChange={(e) => updateSettings({ mcpUrl: e.target.value })}
            placeholder="http://127.0.0.1:8765/mcp"
            className="w-full mt-2 px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          <p className="text-xs theme-text-dim mt-1">
            启用后顾问可调用 24 个专业工具。运行 Barista.exe 会自动启动本地 MCP Server；也可手动运行 start.bat / start.sh。
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.webSearchEnabled}
              onChange={(e) => updateSettings({ webSearchEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            启用联网搜索（AnySearch）
          </label>
          <input
            type="password"
            value={settings.anysearchApiKey}
            onChange={(e) => updateSettings({ anysearchApiKey: e.target.value })}
            placeholder="AnySearch API Key（可留空走匿名额度）"
            className="w-full mt-2 px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          <p className="text-xs theme-text-dim mt-1">
            联网搜索由 AnySearch 提供（api.anysearch.com）。留空使用匿名免费额度（按 IP 限流）；
            也可填写自己的 Key 提升配额。密钥仅保存在本地浏览器，不会上传。
          </p>
        </div>

        <div className="mb-4">
          <ThemeSwitcher />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm theme-accent hover:underline mt-2"
        >
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          高级设置（查看/编辑系统提示词）
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <textarea
              value={settings.customPrompt || DEFAULT_SYSTEM_PROMPT}
              onChange={(e) => updateSettings({ customPrompt: e.target.value })}
              className="w-full min-h-[200px] px-3 py-2 bg-theme-chat border border-theme-border
                rounded-lg text-xs font-mono outline-none focus:border-theme-accent resize-y"
            />
            <p className="text-xs theme-text-dim mt-1">修改后保存即生效。留空则使用默认提示词</p>
          </div>
        )}

        <div className="flex gap-2 mt-5 pt-4 border-t border-theme-border">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2
              border border-theme-border rounded-lg text-sm hover:bg-theme-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2
              border border-theme-border rounded-lg text-sm hover:bg-theme-hover transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5
            rounded-lg text-sm font-medium transition-colors
            ${saved
              ? 'bg-green-600 text-white'
              : 'bg-theme-accent text-white hover:opacity-90'}`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '已保存' : '保存设置'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  )
}
