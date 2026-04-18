'use client'

import { Users, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { useStore } from '@/lib/store'
import { formatAddress } from '@/lib/utils'

export function HoldersTable() {
  const holders = useStore((s) => s.holders)

  return (
    <GlassPanel header="TOP HOLDERS">
      <div className="space-y-1">
        {holders.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-3.5 h-3.5 text-memeos-text-muted animate-spin" />
            <p className="font-mono text-xs text-memeos-text-muted">Loading holders...</p>
          </div>
        )}
        {holders.map((holder, i) => (
          <div key={holder.address} className="flex items-center justify-between py-1.5 border-b border-memeos-border/50 last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-memeos-text-muted w-4">{i + 1}</span>
              <span className="font-mono text-xs text-memeos-text-dim">{formatAddress(holder.address)}</span>
            </div>
            <span className="font-mono text-xs text-memeos-text">{holder.percentage.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
