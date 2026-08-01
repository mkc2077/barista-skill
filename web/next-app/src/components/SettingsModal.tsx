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
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowSettings(false)
    }, 800)
  }

  const handleProviderChange = (provider: string) => {
    const p = PROVIDERS[provider]
    if (p) {
      updateSettings({ provider, baseUrl: p.baseUrl, model: p.defaultModel })
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
        alert('Imported successfully')
      } catch {
        alert('Import failed: invalid data format')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
      <div className="bezel-double relative animate-entry w-[92%] max-w-md max-h-[88vh]">
        <div className="overflow-y-auto p-6">
          <button onClick={() => setShowSettings(false)} className="absolute top-5 right-5 p-1 hover:bg-theme-hover rounded-lg transition-colors ease-editorial" aria-label="Close">
            <X className="w-4 h-4 theme-text-dim" strokeWidth={1.5} />
          </button>
          <span className="eyebrow">API Settings</span>
          <h2 className="font-editorial text-2xl theme-primary mt-4 mb-5">Add your model</h2>

          <div className="mb-4">
            <label className="block text-xs font-medium theme-text-dim mb-1.5">Provider</label>
            <select value={settings.provider} onChange={(e) => handleProviderChange(e.target.value)} className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-sm outline-none focus:border-theme-accent transition-colors ease-editorial">
              <option value="">-- Select --</option>
              {Object.entries(PROVIDERS).map(([key, p]) => (<option key={key} value={key}>{p.name}</option>))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium theme-text-dim mb-1.5">API Key</label>
            <input type="password" value={settings.apiKey} onChange={(e) => updateSettings({ apiKey: e.target.value })} placeholder="sk-…" className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-sm outline-none focus:border-theme-accent transition-colors ease-editorial" />
            <p className="text-xs theme-text-dim mt-1">Key stays local in your browser</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium theme-text-dim mb-1.5">Base URL</label>
            <input type="text" value={settings.baseUrl} onChange={(e) => updateSettings({ baseUrl: e.target.value })} placeholder="https://api.openai.com/v1" className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-sm outline-none focus:border-theme-accent transition-colors ease-editorial" />
          </div>

          <div className="mb-4"><ModelSelector /></div>

          <div className="mb-4">
            <label className="flex items-center justify-between text-xs font-medium theme-text-dim mb-1.5"><span>Temperature</span><span className="font-keystroke theme-primary">{settings.temperature.toFixed(1)}</span></label>
            <input type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })} className="w-full" />
            <p className="text-xs theme-text-dim mt-1">Higher = more creative, lower = more conservative</p>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={settings.mcpEnabled} onChange={(e) => updateSettings({ mcpEnabled: e.target.checked })} className="w-4 h-4" /> MCP tools (needs local server)</label>
            <input type="text" value={settings.mcpUrl} onChange={(e) => updateSettings({ mcpUrl: e.target.value })} placeholder="http://127.0.0.1:8765/mcp" className="w-full mt-2 px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-sm outline-none focus:border-theme-accent transition-colors ease-editorial" />
            <p className="text-xs theme-text-dim mt-1">Starts 25 tools. Barista.exe auto-launches MCP</p>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={settings.webSearchEnabled} onChange={(e) => updateSettings({ webSearchEnabled: e.target.checked })} className="w-4 h-4" /> Web Search (AnySearch)</label>
            <input type="password" value={settings.anysearchApiKey} onChange={(e) => updateSettings({ anysearchApiKey: e.target.value })} placeholder="AnySearch Key (optional if anonymous)" className="w-full mt-2 px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-sm outline-none focus:border-theme-accent transition-colors ease-editorial" />
            <p className="text-xs theme-text-dim mt-1">Key stays in your browser; anonymous tier free</p>
          </div>

          <div className="mb-4"><ThemeSwitcher /></div>

          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-sm theme-accent hover:underline mt-2 transition-colors ease-editorial">
            {showAdvanced ? <ChevronDown className="w-4 h-4" strokeWidth={1.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}Advanced (system prompt)
          </button>
          {showAdvanced && (
            <div className="mt-3">
              <textarea value={settings.customPrompt || DEFAULT_SYSTEM_PROMPT} onChange={(e) => updateSettings({ customPrompt: e.target.value })} className="w-full min-h-[200px] px-3 py-2 bg-theme-chat border border-theme-border rounded-xl text-xs font-keystroke outline-none focus:border-theme-accent transition-colors ease-editorial resize-y" />
              <p className="text-xs theme-text-dim mt-1">Leave empty for default</p>
            </div>
          )}

          <div className="flex gap-2 mt-5 pt-4 border-t border-theme-border">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-theme-border rounded-xl text-sm hover:bg-theme-hover transition-colors ease-editorial press-physics"><Download className="w-4 h-4" strokeWidth={1.5} /> Export</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-theme-border rounded-xl text-sm hover:bg-theme-hover transition-colors ease-editorial press-physics"><Upload className="w-4 h-4" strokeWidth={1.5} /> Import</button>
          </div>

          <button onClick={handleSave} disabled={saved} className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ease-editorial press-physics ${saved ? 'bg-green-600 text-white' : 'bg-theme-accent text-white hover:opacity-90'}`}>
            {saved ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Save className="w-4 h-4" strokeWidth={1.5} />}{saved ? 'Saved' : 'Save'}
          </button>

          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  )
}
