'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { History, ExternalLink, Clock, Globe, Crown, Shuffle, Flame, Trophy, ChevronRight } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { formatAddress, timeAgo } from '@/lib/utils'

interface GlobalToken {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  vibePrompt?: string
  viralityScore?: number
  deployedAt: string
}

export function DeployHistory() {
  const router = useRouter()
  const [tokens, setTokens] = useState<GlobalToken[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [devAddress, setDevAddress] = useState<string>('')

  const handleRemix = (token: GlobalToken) => {
    const seed = token.vibePrompt || token.tagline || `remix of ${token.name}`
    router.push(`/?remix=${encodeURIComponent(seed)}`)
  }

  useEffect(() => {
    let cancelled = false

    const fetchGlobalHistory = async () => {
      try {
        const res = await fetch('/api/history/global')
        const data = await res.json()
        if (cancelled) return
        const all = data.tokens || []
        setTokens(all.slice(0, 4))
        setTotalCount(all.length)
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
            {totalCount} empire{totalCount !== 1 ? 's' : ''} on BSC
          </span>
        </div>

        <div className="space-y-2 pr-1">
          {tokens.map((token, i) => (
            <div
              key={`${token.tokenAddress}-${i}`}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-memeos-surface/50 border border-memeos-border/50 hover:border-memeos-cyan/30 transition-colors group"
            >
              {/* Token image or placeholder */}
              {token.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={token.imageUrl}
                  alt={token.name}
                  className="w-10 h-10 rounded-md border border-memeos-border flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-md border border-memeos-border flex-shrink-0 bg-memeos-surface flex items-center justify-center">
                  <History className="w-4 h-4 text-memeos-cyan" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-memeos-text font-medium truncate">
                    {token.name || 'Unknown'}
                  </span>
                  {token.symbol && (
                    <span className="font-mono text-[10px] text-memeos-violet flex-shrink-0">
                      ${token.symbol}
                    </span>
                  )}
                  {typeof token.viralityScore === 'number' && (
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                      token.viralityScore >= 85 ? 'text-memeos-emerald border-memeos-emerald/30 bg-memeos-emerald/10' :
                      token.viralityScore >= 70 ? 'text-memeos-cyan border-memeos-cyan/30 bg-memeos-cyan/10' :
                      token.viralityScore >= 55 ? 'text-memeos-amber border-memeos-amber/30 bg-memeos-amber/10' :
                      'text-memeos-text-muted border-memeos-border'
                    }`}>
                      <Flame className="w-2.5 h-2.5" />
                      {token.viralityScore}
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
                {token.tagline && (
                  <p className="font-mono text-[10px] text-memeos-text-dim italic truncate mt-0.5">
                    &ldquo;{token.tagline}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleRemix(token)}
                  title="Remix this concept"
                  className="p-1.5 rounded border border-memeos-border hover:border-memeos-violet/50 hover:text-memeos-violet text-memeos-text-muted transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <Link
                  href={`/empire/${token.tokenAddress}`}
                  title="View empire"
                  className="p-1.5 rounded border border-memeos-border hover:border-memeos-cyan/50 hover:text-memeos-cyan text-memeos-text-muted transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={token.fourMemeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on four.meme"
                  className="p-1.5 rounded border border-memeos-border hover:border-memeos-cyan/50 hover:text-memeos-cyan text-memeos-text-muted transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
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

        {totalCount > tokens.length && (
          <Link
            href="/leaderboard"
            className="group mt-3 flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-memeos-amber/5 via-memeos-cyan/5 to-memeos-violet/5 border border-memeos-border/50 hover:border-memeos-amber/40 hover:shadow-[0_0_18px_rgba(245,158,11,0.12)] transition-all"
          >
            {/* Stacked circles showing hidden empires */}
            <div className="flex -space-x-2 flex-shrink-0">
              {[...Array(Math.min(3, totalCount - tokens.length))].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-memeos-surface border-2 border-memeos-bg flex items-center justify-center"
                  style={{ zIndex: 3 - i }}
                >
                  <Trophy className={`w-3 h-3 ${
                    i === 0 ? 'text-memeos-amber' :
                    i === 1 ? 'text-memeos-cyan' :
                    'text-memeos-violet'
                  }`} />
                </div>
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-memeos-text font-medium">
                <span className="text-memeos-amber">+{totalCount - tokens.length}</span> more empire{totalCount - tokens.length !== 1 ? 's' : ''} on the leaderboard
              </div>
              <div className="font-mono text-[10px] text-memeos-text-muted mt-0.5">
                See the full rankings by viral score, bonding curve, and more
              </div>
            </div>

            <div className="flex items-center gap-1 text-memeos-amber font-mono text-[10px] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              Hall of Fame
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}

        {totalCount > 0 && totalCount <= tokens.length && (
          <Link
            href="/leaderboard"
            className="group mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-memeos-border/50 hover:border-memeos-amber/40 hover:bg-memeos-amber/5 transition-all"
          >
            <Trophy className="w-3 h-3 text-memeos-amber" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-memeos-text-dim group-hover:text-memeos-amber transition-colors">
              View Hall of Fame
            </span>
            <ChevronRight className="w-3 h-3 text-memeos-text-muted group-hover:text-memeos-amber transition-colors" />
          </Link>
        )}
      </GlassPanel>
    </div>
  )
}
