'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Terminal, LayoutDashboard, Home } from 'lucide-react'
import { TradeFeed } from './trade-feed'
import { BondingCurve } from './bonding-curve'
import { MarketStats } from './market-stats'
import { HoldersTable } from './holders-table'
import { MemePassport } from '@/components/passport/meme-passport'
import { MissionControl } from '@/components/dashboard/mission-control'
import { VoiceToggle } from '@/components/ui/voice-toggle'
import { useStore } from '@/lib/store'

export function EmpireMode() {
  const router = useRouter()
  const deployResult = useStore((s) => s.deployResult)
  const addTrade = useStore((s) => s.addTrade)
  const setPriceData = useStore((s) => s.setPriceData)
  const setHolders = useStore((s) => s.setHolders)
  const setBondingCurveProgress = useStore((s) => s.setBondingCurveProgress)
  const setPhase = useStore((s) => s.setPhase)
  const resetAll = useStore((s) => s.resetAll)

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

  const goHome = () => {
    resetAll()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-memeos-bg">
      {/* Top nav — styled to match the dashboard for consistency */}
      <div className="border-b border-memeos-border bg-memeos-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Home + Back-to-Dashboard */}
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="flex items-center gap-1.5 font-mono text-sm text-memeos-text-muted hover:text-memeos-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="h-4 w-px bg-memeos-border" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-memeos-cyan" />
              <span className="font-mono text-memeos-cyan text-base font-bold tracking-wider">MEMEOS</span>
              <span className="font-mono text-[10px] text-memeos-emerald bg-memeos-emerald/10 border border-memeos-emerald/30 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-memeos-emerald animate-pulse" />
                Empire Mode
              </span>
            </div>
          </div>

          {/* Right: voice toggle + back-to-dashboard button */}
          <div className="flex items-center gap-2">
            <VoiceToggle />
            <button
              onClick={() => setPhase('deployed')}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
            <button
              onClick={goHome}
              title="Go to landing"
              className="flex items-center justify-center p-1.5 rounded-lg border border-memeos-border hover:border-memeos-cyan/40 hover:text-memeos-cyan text-memeos-text-muted transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
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
