'use client'

import { useCallback, useRef } from 'react'
import { useStore } from './store'
import type { AgentEvent, DeployResult } from '@/src/types'
import { saveDeployedToken } from './history'

function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (parsed: Record<string, unknown>) => void,
) {
  const decoder = new TextDecoder()
  let buffer = ''

  async function read(): Promise<void> {
    const { done, value } = await reader.read()
    if (done) return

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          onEvent(JSON.parse(data))
        } catch { /* skip */ }
      }
    }

    return read()
  }

  return read()
}

export function useSwarmGenerate() {
  const { setPhase, addAgentEvent, setGenerated, setError, resetAgents } = useStore()
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(async (vibePrompt: string) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    resetAgents()
    setError(null)
    setPhase('building')

    try {
      const response = await fetch('/api/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibePrompt }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`Swarm failed: ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      await parseSSEStream(reader, (parsed) => {
        if (parsed.type === 'agent-event') {
          addAgentEvent(parsed.event as AgentEvent)
        } else if (parsed.type === 'generated') {
          setGenerated(parsed.result as any)
          setPhase('review')
        } else if (parsed.type === 'error') {
          setError(parsed.message as string)
        }
      })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message)
      }
    }
  }, [setPhase, addAgentEvent, setGenerated, setError, resetAgents])

  return { generate }
}

export function useDeployToken() {
  const { setPhase, addAgentEvent, setDeployResult, setError } = useStore()

  const deploy = useCallback(async (data: {
    concept: unknown
    narrative: unknown
    visuals: unknown
    vibePrompt?: string
    virality?: {
      score: number
      breakdown: { naming: number; visual: number; narrative: number; timing: number }
      verdict: string
      riskFlags: string[]
    } | null
  }) => {
    setError(null)
    setPhase('deploying')

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error(`Deploy failed: ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      await parseSSEStream(reader, (parsed) => {
        if (parsed.type === 'agent-event') {
          addAgentEvent(parsed.event as AgentEvent)
        } else if (parsed.type === 'deployed') {
          const token = parsed.token as DeployResult
          setDeployResult(token)
          setPhase('deployed')
          saveDeployedToken({
            name: token.name,
            symbol: token.symbol,
            tokenAddress: token.tokenAddress,
            txHash: token.txHash,
            fourMemeUrl: token.fourMemeUrl,
            deployedAt: new Date().toISOString(),
          })
        } else if (parsed.type === 'error') {
          setError(parsed.message as string)
          // Stay on deploying phase — show error there, don't jump back
        }
      })
    } catch (e) {
      setError((e as Error).message)
      // Stay on deploying phase so user can see the error
    }
  }, [setPhase, addAgentEvent, setDeployResult, setError])

  return { deploy }
}
