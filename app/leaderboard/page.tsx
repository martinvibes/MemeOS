'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Crown,
  Medal,
  ArrowLeft,
  BookOpen,
  Terminal,
  Flame,
  TrendingUp,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Rocket,
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { GlowButton } from '@/components/ui/glow-button'
import { formatAddress, timeAgo } from '@/lib/utils'

// ----- Types -----

interface EnrichedToken {
  name: string
  symbol: string
  tokenAddress: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  viralityScore?: number
  bondingCurveProgress: number
  deployedAt: string
}

type SortMode = 'virality' | 'bonding' | 'recent'

// ----- Helpers -----

const TABS: Array<{ key: SortMode; label: string; icon: typeof Flame }> = [
  { key: 'virality', label: 'VIRAL SCORE', icon: Flame },
  { key: 'bonding', label: 'BONDING CURVE', icon: TrendingUp },
  { key: 'recent', label: 'NEWEST', icon: Clock },
]

function getMetric(token: EnrichedToken, sort: SortMode): { value: string; label: string; color: string } {
  if (sort === 'bonding') {
    return {
      value: `${token.bondingCurveProgress.toFixed(1)}%`,
      label: 'BONDING',
      color: 'text-memeos-emerald',
    }
  }
  if (sort === 'recent') {
    return {
      value: timeAgo(token.deployedAt),
      label: 'LAUNCHED',
      color: 'text-memeos-cyan',
    }
  }
  return {
    value: typeof token.viralityScore === 'number' ? String(token.viralityScore) : '—',
    label: 'VIRAL',
    color: 'text-memeos-amber',
  }
}

function getMetricPercent(token: EnrichedToken, sort: SortMode): number {
  if (sort === 'bonding') return Math.min(100, Math.max(0, token.bondingCurveProgress))
  if (sort === 'virality') return Math.min(100, Math.max(0, token.viralityScore ?? 0))
  // For "recent" use a decay bar — newer = fuller
  const age = Date.now() - new Date(token.deployedAt).getTime()
  const dayMs = 1000 * 60 * 60 * 24
  const days = age / dayMs
  return Math.max(5, 100 - days * 10)
}

// ----- Sub-components -----

function PodiumCard({
  token,
  rank,
  sort,
  index,
}: {
  token: EnrichedToken
  rank: 1 | 2 | 3
  sort: SortMode
  index: number
}) {
  const metric = getMetric(token, sort)

  const rankStyles: Record<
    number,
    {
      icon: typeof Crown
      iconColor: string
      glow: 'cyan' | 'violet' | 'amber'
      order: string
      heightOffset: string
      borderColor: string
      ringColor: string
      bgGlow: string
      label: string
    }
  > = {
    1: {
      icon: Crown,
      iconColor: 'text-memeos-amber',
      glow: 'amber',
      order: 'md:order-2',
      heightOffset: 'md:-translate-y-6',
      borderColor: 'border-memeos-amber/50',
      ringColor: 'ring-memeos-amber/40',
      bgGlow: 'bg-gradient-to-b from-memeos-amber/10 via-memeos-amber/5 to-transparent',
      label: '#1 CHAMPION',
    },
    2: {
      icon: Medal,
      iconColor: 'text-memeos-text-dim',
      glow: 'cyan',
      order: 'md:order-1',
      heightOffset: 'md:translate-y-0',
      borderColor: 'border-memeos-cyan/40',
      ringColor: 'ring-memeos-cyan/30',
      bgGlow: 'bg-gradient-to-b from-memeos-cyan/10 via-memeos-cyan/5 to-transparent',
      label: '#2 RUNNER-UP',
    },
    3: {
      icon: Medal,
      iconColor: 'text-memeos-text-muted',
      glow: 'violet',
      order: 'md:order-3',
      heightOffset: 'md:translate-y-4',
      borderColor: 'border-memeos-violet/40',
      ringColor: 'ring-memeos-violet/30',
      bgGlow: 'bg-gradient-to-b from-memeos-violet/10 via-memeos-violet/5 to-transparent',
      label: '#3 CONTENDER',
    },
  }

  const style = rankStyles[rank]
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className={`${style.order} ${style.heightOffset} flex`}
    >
      <div
        className={`relative w-full flex flex-col items-center text-center p-6 rounded-2xl border ${style.borderColor} bg-memeos-surface/40 backdrop-blur-sm overflow-hidden group`}
      >
        {/* Glow backdrop */}
        <div className={`absolute inset-0 ${style.bgGlow} pointer-events-none`} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-memeos-cyan/50 to-transparent" />

        {/* Rank label */}
        <div className="relative flex items-center gap-1.5 mb-3">
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${style.iconColor}`}>
            {style.label}
          </span>
        </div>

        {/* Token image */}
        <div className="relative mb-4">
          <div
            className={`absolute inset-0 rounded-2xl blur-xl opacity-60 ${
              rank === 1 ? 'bg-memeos-amber/30' : rank === 2 ? 'bg-memeos-cyan/20' : 'bg-memeos-violet/20'
            }`}
          />
          {token.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.imageUrl}
              alt={token.name}
              className={`relative w-20 h-20 rounded-2xl object-cover border-2 ${style.borderColor} ring-4 ${style.ringColor}`}
            />
          ) : (
            <div
              className={`relative w-20 h-20 rounded-2xl border-2 ${style.borderColor} ring-4 ${style.ringColor} bg-memeos-surface flex items-center justify-center`}
            >
              <Trophy className={`w-8 h-8 ${style.iconColor}`} />
            </div>
          )}
        </div>

        {/* Name + ticker */}
        <div className="relative mb-2">
          <div className="font-mono text-base font-bold text-memeos-text">{token.name}</div>
          <div className="font-mono text-xs text-memeos-text-dim">${token.symbol}</div>
        </div>

        {/* Metric — big number */}
        <div className="relative mb-3">
          <div className={`font-mono text-4xl font-bold ${metric.color} leading-none`}>
            {metric.value}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-memeos-text-muted mt-1">
            {metric.label}
          </div>
        </div>

        {/* Tagline */}
        {token.tagline && (
          <p className="relative font-mono text-[11px] text-memeos-text-dim italic line-clamp-2 mb-4 min-h-[2.5em]">
            &ldquo;{token.tagline}&rdquo;
          </p>
        )}

        {/* Action */}
        <div className="relative mt-auto w-full">
          <Link
            href={`/empire/${token.tokenAddress}`}
            className="flex items-center justify-center gap-1.5 w-full font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            View Empire
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function RankingRow({
  token,
  rank,
  sort,
  index,
}: {
  token: EnrichedToken
  rank: number
  sort: SortMode
  index: number
}) {
  const metric = getMetric(token, sort)
  const percent = getMetricPercent(token, sort)

  const barColor =
    sort === 'bonding'
      ? 'from-memeos-emerald to-memeos-cyan'
      : sort === 'virality'
      ? 'from-memeos-amber to-memeos-red'
      : 'from-memeos-cyan to-memeos-violet'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      className="group flex items-center gap-3 p-3 rounded-xl border border-memeos-border/60 bg-memeos-surface/40 hover:border-memeos-cyan/40 hover:bg-memeos-surface/70 transition-all"
    >
      {/* Rank number */}
      <div className="flex-shrink-0 w-10 text-center">
        <span className="font-mono text-xl font-bold text-memeos-text-dim group-hover:text-memeos-cyan transition-colors">
          {String(rank).padStart(2, '0')}
        </span>
      </div>

      {/* Image */}
      {token.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={token.imageUrl}
          alt={token.name}
          className="w-10 h-10 rounded-lg object-cover border border-memeos-border flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg border border-memeos-border flex-shrink-0 bg-memeos-surface flex items-center justify-center">
          <Trophy className="w-4 h-4 text-memeos-text-muted" />
        </div>
      )}

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-memeos-text truncate">
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
          <span className="font-mono text-[10px] text-memeos-text-dim">•</span>
          <span className="font-mono text-[10px] text-memeos-text-dim">
            {timeAgo(token.deployedAt)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-memeos-border/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Metric */}
      <div className="flex-shrink-0 text-right">
        <div className={`font-mono text-lg font-bold ${metric.color} leading-none`}>
          {metric.value}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-memeos-text-muted mt-1">
          {metric.label}
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/empire/${token.tokenAddress}`}
        className="flex-shrink-0 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-memeos-border text-memeos-text-muted hover:border-memeos-cyan/40 hover:text-memeos-cyan transition-colors"
      >
        Empire
        <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  )
}

// ----- Main page -----

export default function LeaderboardPage() {
  const router = useRouter()
  const [sort, setSort] = useState<SortMode>('virality')
  const [tokens, setTokens] = useState<EnrichedToken[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState<number>(Date.now())
  const [tick, setTick] = useState(0)

  const fetchLeaderboard = useCallback(async (mode: SortMode) => {
    try {
      const res = await fetch(`/api/leaderboard?sort=${mode}`, { cache: 'no-store' })
      const data = await res.json()
      setTokens(data.tokens || [])
      setLastFetched(Date.now())
    } catch (err) {
      console.error('[leaderboard] fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial + sort-change fetch
  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(sort)
  }, [sort, fetchLeaderboard])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(sort)
    }, 30_000)
    return () => clearInterval(interval)
  }, [sort, fetchLeaderboard])

  // Tick every second to update "refreshed X ago"
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const secondsAgo = Math.max(0, Math.floor((Date.now() - lastFetched) / 1000))
  // keep tick referenced so eslint doesn't complain
  void tick

  const podium = useMemo(() => tokens.slice(0, 3), [tokens])
  const rest = useMemo(() => tokens.slice(3, 20), [tokens])

  return (
    <main className="min-h-screen bg-memeos-bg relative overflow-hidden">
      {/* Ambient grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-memeos-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 left-10 w-[30vw] h-[30vh] bg-memeos-violet/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-60 right-10 w-[30vw] h-[30vh] bg-memeos-amber/10 blur-[100px] rounded-full pointer-events-none" />

      {/* === Top Nav === */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-memeos-border/50 bg-memeos-bg/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 font-mono text-sm text-memeos-text-muted hover:text-memeos-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="h-4 w-px bg-memeos-border" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-memeos-cyan" />
              <span className="font-mono text-memeos-cyan text-sm font-bold tracking-wider">
                MEMEOS
              </span>
              <span className="font-mono text-[9px] text-memeos-text-muted bg-memeos-surface px-1.5 py-0.5 rounded border border-memeos-border">
                v1.0
              </span>
            </div>
          </div>
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            How it works
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-20">
        {/* === Hero === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10px] text-memeos-emerald bg-memeos-emerald/10 border border-memeos-emerald/30 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-memeos-emerald animate-pulse" />
            LIVE RANKINGS
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-10 h-10 text-memeos-amber drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
            <h1 className="font-mono text-4xl md:text-6xl font-bold text-memeos-cyan tracking-tight drop-shadow-[0_0_30px_rgba(0,229,255,0.4)]">
              HALL OF FAME
            </h1>
            <Trophy className="w-10 h-10 text-memeos-amber drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
          </div>
          <p className="font-mono text-sm md:text-base text-memeos-text-dim">
            Live rankings of every MemeOS empire
          </p>
        </motion.div>

        {/* === Tabs + refresh indicator === */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = sort === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setSort(tab.key)}
                  className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border transition-all ${
                    active
                      ? 'border-memeos-cyan/60 bg-memeos-cyan/10 text-memeos-cyan shadow-glow-cyan'
                      : 'border-memeos-border bg-memeos-surface/50 text-memeos-text-muted hover:text-memeos-text hover:border-memeos-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-memeos-text-muted">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-memeos-cyan' : ''}`} />
            Refreshed {secondsAgo}s ago
          </div>
        </div>

        {/* === Content === */}
        <AnimatePresence mode="wait">
          {loading && tokens.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <RefreshCw className="w-8 h-8 text-memeos-cyan animate-spin mb-4" />
              <p className="font-mono text-sm text-memeos-text-dim">
                Loading the Hall of Fame...
              </p>
            </motion.div>
          ) : tokens.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <GlassPanel glow="violet" className="max-w-lg w-full">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-memeos-amber/20 blur-2xl rounded-full" />
                    <Trophy className="relative w-16 h-16 text-memeos-amber" />
                  </div>
                  <h3 className="font-mono text-xl font-bold text-memeos-text mb-2">
                    The Hall Awaits
                  </h3>
                  <p className="font-mono text-sm text-memeos-text-dim mb-6 max-w-sm">
                    No empires have been crowned yet. Be the first to carve
                    your name into MemeOS history.
                  </p>
                  <Link href="/">
                    <GlowButton variant="amber" size="md">
                      <span className="flex items-center gap-2">
                        <Rocket className="w-3.5 h-3.5" />
                        Launch the first empire
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </GlowButton>
                  </Link>
                </div>
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div
              key={`board-${sort}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* === Podium === */}
              {podium.length > 0 && (
                <div className="mb-12 md:mb-16">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
                    {podium.map((token, idx) => (
                      <PodiumCard
                        key={token.tokenAddress}
                        token={token}
                        rank={(idx + 1) as 1 | 2 | 3}
                        sort={sort}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* === Rankings 4+ === */}
              {rest.length > 0 && (
                <GlassPanel glow="cyan">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-memeos-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-memeos-cyan" />
                      <span className="font-mono text-xs text-memeos-text-dim uppercase tracking-wider">
                        Rankings 04 – {String(3 + rest.length).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-memeos-text-muted">
                      {tokens.length} empire{tokens.length !== 1 ? 's' : ''} total
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rest.map((token, idx) => (
                      <RankingRow
                        key={token.tokenAddress}
                        token={token}
                        rank={idx + 4}
                        sort={sort}
                        index={idx}
                      />
                    ))}
                  </div>
                </GlassPanel>
              )}

              {/* Footer strip */}
              <div className="mt-10 text-center">
                <p className="font-mono text-[10px] text-memeos-text-muted">
                  LIVE BSC DATA · BONDING CURVE VIA ON-CHAIN RPC · AUTO-REFRESH 30s
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
