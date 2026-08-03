import { useState } from 'react'
import { fetchModels } from '@/lib/providers'

interface UseLocalModelsResult {
  discoveredModels: string[]
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
  discover: (baseUrl: string, apiKey: string, providerKey: string) => Promise<void>
  reset: () => void
}

export function useLocalModels(): UseLocalModelsResult {
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const discover = async (baseUrl: string, apiKey: string, providerKey: string) => {
    if (!baseUrl) {
      setStatus('error')
      setMessage('请先填写 Base URL')
      return
    }

    setStatus('loading')
    setMessage('正在获取模型列表...')

    try {
      const models = await fetchModels(providerKey, baseUrl, apiKey)

      if (models.length === 0) {
        setStatus('error')
        setMessage('连接成功，但未发现任何模型')
        return
      }

      setDiscoveredModels(models)
      setStatus('success')
      setMessage('发现 ' + models.length + ' 个可用模型')
    } catch (err: unknown) {
      setStatus('error')
      const msg = err instanceof Error ? err.message : String(err)
      setMessage('获取失败: ' + msg)
    }
  }

  const reset = () => {
    setDiscoveredModels([])
    setStatus('idle')
    setMessage('')
  }

  return { discoveredModels, status, message, discover, reset }
}
