'use client'

import { useLocalModels } from '@/hooks/useLocalModels'
import { PROVIDERS } from '@/lib/providers'
import { useStore } from '@/store'
import { Search, ChevronDown } from 'lucide-react'

interface ModelSelectorProps {
  showDiscover?: boolean
}

export function ModelSelector({ showDiscover = true }: ModelSelectorProps) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const { discoveredModels, status, message, discover } = useLocalModels()

  const provider = PROVIDERS[settings.provider] || PROVIDERS.custom
  const availableModels = discoveredModels.length > 0 ? discoveredModels : provider.models

  const handleDiscover = () => {
    discover(settings.baseUrl, settings.apiKey, settings.provider)
  }

  return (
    <div>
      <label className="block text-xs font-medium theme-text-dim mb-1.5">模型</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value })}
            placeholder="gpt-5.4-mini"
            className="w-full px-3 py-2 pr-8 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          {availableModels.length > 0 && (
            <select
              onChange={(e) => updateSettings({ model: e.target.value })}
              value=""
              className="absolute right-0 top-0 h-full w-8 appearance-none bg-transparent cursor-pointer
                opacity-0"
            >
              <option value="" disabled>选择</option>
              {availableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-dim pointer-events-none" />
        </div>
        {showDiscover && (
          <button
            onClick={handleDiscover}
            disabled={status === 'loading' || !settings.baseUrl}
            className="px-3 py-2 border border-theme-border rounded-lg text-sm
              hover:border-theme-accent hover:bg-theme-hover transition-all
              disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
            title="从供应商 API 获取可用模型列表"
          >
            <Search className="w-4 h-4" />
            {status === 'loading' ? '获取中...' : '获取模型'}
          </button>
        )}
      </div>

      {availableModels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {availableModels.slice(0, 8).map(model => (
            <button
              key={model}
              onClick={() => updateSettings({ model })}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all
                ${settings.model === model
                  ? 'border-theme-primary bg-theme-hover theme-primary'
                  : 'border-theme-border theme-text-dim hover:border-theme-accent'
                }`}
            >
              {model}
            </button>
          ))}
          {availableModels.length > 8 && (
            <span className="px-2.5 py-1 text-xs theme-text-dim">
              +{availableModels.length - 8} 更多
            </span>
          )}
        </div>
      )}

      {message && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-500' : 'theme-text-dim'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
