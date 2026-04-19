'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Loader2,
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatAddress, formatUSD, timeAgo } from '@/lib/utils'
import type { Trade, PriceUpdate, Holder } from '@/src/types'

interface LivePanelsProps {
  tokenAddress: string
}

export function LivePanels({ tokenAddress }: LivePanelsProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [priceData, setPriceData] = useState<PriceUpdate | null>(null)
  const [holders, setHolders] = useState<Holder[]>([])
  const [bondingProgress, setBondingProgress] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!tokenAddress) return

    const eventSource = new EventSource(
      `/api/market/live?token=${tokenAddress}`
    )

    eventSource.onopen = () => setConnected(true)
    eventSource.onerror = () => setConnected(false)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'trade') {
          setTrades((prev) => [data.trade, ...prev].slice(0, 100))
        } else if (data.type === 'price') {
          setPriceData(data.price)
        } else if (data.type === 'holders') {
          setHolders(data.holders)
        } else if (data.type === 'bonding') {
          setBondingProgress(data.progress)
        }
      } catch {
        // skip malformed messages
      }
    }

    return () => {
      eventSource.close()
    }
  }, [tokenAddress])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MarketStatsPanel priceData={priceData} />
      <BondingCurvePanel progress={bondingProgress} />
      <TradeFeedPanel trades={trades} connected={connected} />
      <HoldersTablePanel holders={holders} />
    </div>
  )
}

/* -------------------- Market stats -------------------- */

function MarketStatsPanel({ priceData }: { priceData: PriceUpdate | null }) {
  const stats = [
    {
      label: 'Price',
      value: priceData ? formatUSD(priceData.price) : '--',
      icon: DollarSign,
      color: 'text-memeos-emerald',
    },
    {
      label: 'Market Cap',
      value: priceData ? formatUSD(priceData.marketCap) : '--',
      icon: TrendingUp,
      color: 'text-memeos-cyan',
    },
    {
      label: 'Volume',
      value: priceData ? formatUSD(priceData.volume) : '--',
      icon: Activity,
      color: 'text-memeos-amber',
    },
  ]

  return (
    <GlassPanel header="MARKET DATA" glow="amber">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="font-mono text-lg text-memeos-text mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}

/* -------------------- Bonding curve -------------------- */

function BondingCurvePanel({ progress }: { progress: number }) {
  return (
    <GlassPanel header="BONDING CURVE" glow="cyan">
      <ProgressBar
        value={progress}
        max={100}
        label="Progress to Graduation"
        color={progress >= 95 ? 'emerald' : progress >= 50 ? 'amber' : 'cyan'}
      />
      <p className="font-mono text-[10px] text-memeos-text-muted mt-2 text-center">
        {progress >= 100
          ? 'Graduated to PancakeSwap!'
          : `${(100 - progress).toFixed(1)}% remaining to PancakeSwap migration`}
      </p>
    </GlassPanel>
  )
}

/* -------------------- Trade feed -------------------- */

function TradeFeedPanel({
  trades,
  connected,
}: {
  trades: Trade[]
  connected: boolean
}) {
  return (
    <GlassPanel header="LIVE TRADES" glow="cyan">
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {trades.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4">
            {connected ? (
              <Loader2 className="w-3.5 h-3.5 text-memeos-text-muted animate-spin" />
            ) : null}
            <p className="font-mono text-xs text-memeos-text-muted">
              {connected ? 'Waiting for trades...' : 'Connecting to BSC...'}
            </p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {trades.slice(0, 20).map((trade, i) => (
            <motion.div
              key={`${trade.txHash}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between py-1.5 border-b border-memeos-border/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                {trade.side === 'buy' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-memeos-emerald" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-memeos-red" />
                )}
                <span
                  className={`font-mono text-xs font-bold ${
                    trade.side === 'buy'
                      ? 'text-memeos-emerald'
                      : 'text-memeos-red'
                  }`}
                >
                  {trade.side === 'buy' ? 'BUY' : 'SELL'}
                </span>
                <span className="font-mono text-[11px] text-memeos-text-dim">
                  {formatAddress(trade.buyer)}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-memeos-text">
                  {formatUSD(trade.priceUSD * trade.amount)}
                </span>
                <span className="font-mono text-[10px] text-memeos-text-muted ml-2">
                  {timeAgo(trade.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}

/* -------------------- Holders table -------------------- */

function HoldersTablePanel({ holders }: { holders: Holder[] }) {
  return (
    <GlassPanel header="TOP HOLDERS" glow="violet">
      <div className="space-y-1">
        {holders.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-3.5 h-3.5 text-memeos-text-muted animate-spin" />
            <p className="font-mono text-xs text-memeos-text-muted">
              Loading holders...
            </p>
          </div>
        )}
        {holders.map((holder, i) => (
          <div
            key={holder.address}
            className="flex items-center justify-between py-1.5 border-b border-memeos-border/50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-memeos-text-muted w-4">
                {i + 1}
              </span>
              <Users className="w-3 h-3 text-memeos-text-muted" />
              <span className="font-mono text-xs text-memeos-text-dim">
                {formatAddress(holder.address)}
              </span>
            </div>
            <span className="font-mono text-xs text-memeos-text">
              {holder.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
