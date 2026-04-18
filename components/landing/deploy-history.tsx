'use client'

import { useEffect, useState } from 'react'
import { History, ExternalLink, Clock, Globe, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { formatAddress, timeAgo } from '@/lib/utils'

interface GlobalToken {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  deployedAt: string
}

export function DeployHistory() {
  const [tokens, setTokens] = useState<GlobalToken[]>([])
  const [loading, setLoading] = useState(true)
  const [devAddress, setDevAddress] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    const fetchGlobalHistory = async () => {
      try {
        const res = await fetch('/api/history/global')
        const data = await res.json()
        if (cancelled) return
        setTokens((data.tokens || []).slice(0, 8))
        setDevAddress(data.devAddress || '')
      } catch {
        // silent fail — section just won't show
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchGlobalHistory()
    // Refresh every 60s
    const interval = setInterval(fetchGlobalHistory, 60_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Don't render empty state during initial load
  if (loading || tokens.length === 0) return null

  return (
    <div className="mt-6">
      <GlassPanel glow="violet">
        {/* Custom header with global indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-memeos-border">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-memeos-violet" />
            <span className="font-mono text-xs text-memeos-text-dim uppercase tracking-wider">
              Global Deploy Feed
            </span>
            <span className="font-mono text-[10px] text-memeos-emerald bg-memeos-emerald/10 border border-memeos-emerald/30 rounded px-1.5 py-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-memeos-emerald animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="font-mono text-[10px] text-memeos-text-muted">
            {tokens.length} token{tokens.length !== 1 ? 's' : ''} on BSC
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {tokens.map((token, i) => (
            <div
              key={`${token.tokenAddress}-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg bg-memeos-surface/50 border border-memeos-border/50 hover:border-memeos-cyan/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-md border border-memeos-border flex-shrink-0 bg-memeos-surface flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-memeos-cyan" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-memeos-text font-medium truncate">
                    {token.name || 'Unknown'}
                  </span>
                  {token.symbol && (
                    <span className="font-mono text-[10px] text-memeos-violet flex-shrink-0">
                      ${token.symbol}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`https://bscscan.com/address/${token.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-memeos-text-muted hover:text-memeos-cyan"
                  >
                    {formatAddress(token.tokenAddress)}
                  </a>
                  <span className="flex items-center gap-0.5 font-mono text-[10px] text-memeos-text-dim">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(token.deployedAt)}
                  </span>
                </div>
              </div>

              <a
                href={token.fourMemeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-1.5 rounded border border-memeos-border hover:border-memeos-cyan/50 hover:text-memeos-cyan text-memeos-text-muted transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {devAddress && (
          <div className="mt-3 pt-3 border-t border-memeos-border flex items-center justify-between">
            <span className="font-mono text-[9px] text-memeos-text-muted">
              Source: on-chain data via Bitquery
            </span>
            <a
              href={`https://bscscan.com/address/${devAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-memeos-text-muted hover:text-memeos-cyan flex items-center gap-1"
            >
              Deployer: {formatAddress(devAddress)}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
