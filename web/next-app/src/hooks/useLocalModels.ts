import { useState } from 'react'

interface UseLocalModelsResult {
  discoveredModels: string[]
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
  discover: (baseUrl: string, apiKey?: string) => Promise<void>
  reset: () => void
}

export function useLocalModels(): UseLocalModelsResult {
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const discover = async (baseUrl: string, apiKey?: string) => {
    if (!baseUrl) {
      setStatus('error')
      setMessage('请先填写 Base URL')
      return
    }

    setStatus('loading')
    setMessage('正在连接...')

    try {
      const url = `${baseUrl.replace(/\/+$/, '')}/models`
      const headers: Record<string, string> = {}
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

      const resp = await fetch(url, { headers })
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${await resp.text()}`)
      }

      const data = await resp.json()
      const models = (data.data || data.models || []).map((m: any) => m.id || m.name).filter(Boolean)

      if (models.length === 0) {
        setStatus('error')
        setMessage('连接成功，但未发现任何模型')
        return
      }

      setDiscoveredModels(models)
      setStatus('success')
      setMessage(`✅ 发现 ${models.length} 个模型`)
    } catch (err: any) {
      setStatus('error')
      setMessage(`❌ 连接失败: ${err.message}`)
    }
  }

  const reset = () => {
    setDiscoveredModels([])
    setStatus('idle')
    setMessage('')
  }

  return { discoveredModels, status, message, discover, reset }
}
