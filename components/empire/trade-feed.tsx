'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { useStore } from '@/lib/store'
import { formatAddress, formatUSD, timeAgo } from '@/lib/utils'

export function TradeFeed() {
  const trades = useStore((s) => s.trades)

  return (
    <GlassPanel header="LIVE TRADES" glow="cyan">
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {trades.length === 0 && (
          <p className="font-mono text-xs text-memeos-text-muted text-center py-4">
            Waiting for trades...
          </p>
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
                <span className={`font-mono text-xs font-bold ${
                  trade.side === 'buy' ? 'text-memeos-emerald' : 'text-memeos-red'
                }`}>
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
