'use client'

import { useEffect, useState } from 'react'
import { History, ExternalLink, Clock } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { getDeployHistory, type DeployedToken } from '@/lib/history'
import { formatAddress, timeAgo } from '@/lib/utils'

export function DeployHistory() {
  const [history, setHistory] = useState<DeployedToken[]>([])

  useEffect(() => {
    setHistory(getDeployHistory().slice(0, 5))
  }, [])

  if (history.length === 0) return null

  return (
    <div className="mt-6">
      <GlassPanel header="DEPLOYED EMPIRES" glow="violet">
        <div className="space-y-3">
          {history.map((token, i) => (
            <div
              key={`${token.tokenAddress}-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg bg-memeos-surface/50 border border-memeos-border/50 hover:border-memeos-cyan/30 transition-colors"
            >
              {/* Token image */}
              {token.imageUrl ? (
                <img
                  src={token.imageUrl}
                  alt={token.name}
                  className="w-8 h-8 rounded-md border border-memeos-border flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-md border border-memeos-border flex-shrink-0 bg-memeos-surface flex items-center justify-center">
                  <History className="w-3.5 h-3.5 text-memeos-cyan" />
                </div>
              )}

              {/* Token info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-memeos-text font-medium truncate">
                    {token.name}
                  </span>
                  <span className="font-mono text-[10px] text-memeos-violet flex-shrink-0">
                    ${token.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-memeos-text-muted">
                    {formatAddress(token.tokenAddress)}
                  </span>
                  <span className="flex items-center gap-0.5 font-mono text-[10px] text-memeos-text-dim">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(token.deployedAt)}
                  </span>
                </div>
              </div>

              {/* Link to four.meme */}
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
      </GlassPanel>
    </div>
  )
}
