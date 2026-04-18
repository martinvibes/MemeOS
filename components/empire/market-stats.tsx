'use client'

import { DollarSign, TrendingUp, Activity } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { useStore } from '@/lib/store'
import { formatUSD } from '@/lib/utils'

export function MarketStats() {
  const priceData = useStore((s) => s.priceData)

  const stats = [
    { label: 'Price', value: priceData ? formatUSD(priceData.price) : '--', icon: DollarSign, color: 'text-memeos-emerald' },
    { label: 'Market Cap', value: priceData ? formatUSD(priceData.marketCap) : '--', icon: TrendingUp, color: 'text-memeos-cyan' },
    { label: 'Volume', value: priceData ? formatUSD(priceData.volume) : '--', icon: Activity, color: 'text-memeos-amber' },
  ]

  return (
    <GlassPanel header="MARKET DATA" glow="amber">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider">{stat.label}</p>
            <p className="font-mono text-lg text-memeos-text mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
