'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Terminal, Zap } from 'lucide-react'
import { AgentStream } from '@/components/dashboard/agent-stream'
import { MissionControl } from '@/components/dashboard/mission-control'
import { DeployStatus } from '@/components/dashboard/deploy-status'
import { ReviewPanel } from '@/components/dashboard/review-panel'
import { PhaseIndicator } from '@/components/dashboard/phase-indicator'
import { EmpireMode } from '@/components/empire/empire-mode'
import { useStore } from '@/lib/store'
import { useSwarmGenerate } from '@/lib/hooks'

export default function DashboardPage() {
  const router = useRouter()
  const vibePrompt = useStore((s) => s.vibePrompt)
  const phase = useStore((s) => s.phase)
  const error = useStore((s) => s.error)
  const generated = useStore((s) => s.generated)
  const resetAll = useStore((s) => s.resetAll)
  const { generate } = useSwarmGenerate()

  useEffect(() => {
    if (!vibePrompt) {
      router.push('/')
      return
    }
    if (phase === 'building' && !generated) {
      generate(vibePrompt)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Empire mode gets its own full-screen layout
  if (phase === 'empire') {
    return <EmpireMode />
  }

  const handleBack = () => {
    resetAll()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-memeos-bg">
      {/* === Top Navigation Bar === */}
      <div className="border-b border-memeos-border bg-memeos-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: logo + back */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 font-mono text-sm text-memeos-text-muted hover:text-memeos-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="h-4 w-px bg-memeos-border" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-memeos-cyan" />
              <span className="font-mono text-memeos-cyan text-base font-bold tracking-wider">MEMEOS</span>
              <span className="font-mono text-[10px] text-memeos-text-muted bg-memeos-surface px-2 py-0.5 rounded border border-memeos-border">
                v1.0
              </span>
            </div>
          </div>

          {/* Center: vibe prompt */}
          <div className="hidden md:flex items-center gap-2 max-w-md">
            <Zap className="w-3 h-3 text-memeos-amber flex-shrink-0" />
            <span className="font-mono text-xs text-memeos-text-muted truncate">
              {vibePrompt}
            </span>
          </div>

          {/* Right: phase badge */}
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs px-2 py-1 rounded border ${
              phase === 'building' ? 'text-memeos-amber border-memeos-amber/30 bg-memeos-amber/10' :
              phase === 'review' ? 'text-memeos-violet border-memeos-violet/30 bg-memeos-violet/10' :
              phase === 'deploying' ? 'text-memeos-cyan border-memeos-cyan/30 bg-memeos-cyan/10 animate-pulse' :
              phase === 'deployed' ? 'text-memeos-emerald border-memeos-emerald/30 bg-memeos-emerald/10' :
              'text-memeos-text-muted border-memeos-border'
            }`}>
              {phase === 'building' ? 'AGENTS WORKING' :
               phase === 'review' ? 'REVIEW & APPROVE' :
               phase === 'deploying' ? 'DEPLOYING...' :
               phase === 'deployed' ? 'DEPLOYED' : phase.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <PhaseIndicator currentPhase={phase as any} />
        </div>
      </div>

      {/* === Main Content === */}
      <div className="max-w-7xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {/* Building Phase: Agent Swarm */}
          {phase === 'building' && (
            <motion.div
              key="building"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4"
            >
              {/* Agent stream takes 3 cols */}
              <div className="lg:col-span-3">
                <AgentStream />
              </div>
              {/* Side panel takes 2 cols */}
              <div className="lg:col-span-2 space-y-4">
                <MissionControl />
                {error && (
                  <div className="glass-panel p-4">
                    <p className="font-mono text-xs text-memeos-red">{error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Review Phase */}
          {phase === 'review' && generated && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ReviewPanel />
            </motion.div>
          )}

          {/* Deploying Phase */}
          {phase === 'deploying' && (
            <motion.div
              key="deploying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <AgentStream />
              <div className="space-y-4">
                <MissionControl />
                <DeployStatus />
                {error && (
                  <div className="glass-panel p-4 space-y-3">
                    <p className="font-mono text-xs text-memeos-red">{error}</p>
                    <button
                      onClick={() => { useStore.getState().setError(null); useStore.getState().setPhase('review') }}
                      className="font-mono text-xs text-memeos-cyan hover:underline"
                    >
                      Back to Review
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Deployed Phase */}
          {phase === 'deployed' && (
            <motion.div
              key="deployed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <MissionControl />
              <DeployStatus />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
