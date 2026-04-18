'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TradeFeed } from './trade-feed'
import { BondingCurve } from './bonding-curve'
import { MarketStats } from './market-stats'
import { HoldersTable } from './holders-table'
import { MemePassport } from '@/components/passport/meme-passport'
import { MissionControl } from '@/components/dashboard/mission-control'
import { useStore } from '@/lib/store'

export function EmpireMode() {
  const deployResult = useStore((s) => s.deployResult)
  const addTrade = useStore((s) => s.addTrade)
  const setPriceData = useStore((s) => s.setPriceData)
  const setHolders = useStore((s) => s.setHolders)
  const setBondingCurveProgress = useStore((s) => s.setBondingCurveProgress)
  const setPhase = useStore((s) => s.setPhase)

  useEffect(() => {
    if (!deployResult?.tokenAddress) return

    const eventSource = new EventSource(
      `/api/market/live?token=${deployResult.tokenAddress}`
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'trade') addTrade(data.trade)
        if (data.type === 'price') setPriceData(data.price)
        if (data.type === 'holders') setHolders(data.holders)
        if (data.type === 'bonding') setBondingCurveProgress(data.progress)
      } catch {
        // skip
      }
    }

    return () => eventSource.close()
  }, [deployResult?.tokenAddress, addTrade, setPriceData, setHolders, setBondingCurveProgress])

  return (
    <main className="min-h-screen bg-memeos-bg">
      <div className="border-b border-memeos-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-memeos-cyan text-sm font-bold tracking-wider">MEMEOS</span>
          <span className="font-mono text-[10px] text-memeos-emerald bg-memeos-emerald/10 px-2 py-0.5 rounded">EMPIRE MODE</span>
        </div>
        <button onClick={() => setPhase('deployed')} className="font-mono text-[10px] text-memeos-text-muted hover:text-memeos-text">
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <MissionControl />
          <MemePassport />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <MarketStats />
          <BondingCurve />
          <HoldersTable />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <TradeFeed />
        </motion.div>
      </div>
    </main>
  )
}
