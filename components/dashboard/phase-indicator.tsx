'use client'

import { motion } from 'framer-motion'
import { BarChart3, Sparkles, Eye, Rocket, Crown, Check } from 'lucide-react'

type CurrentPhase = 'building' | 'review' | 'deploying' | 'deployed' | 'empire'

interface PhaseIndicatorProps {
  currentPhase: CurrentPhase
}

const PHASES = [
  { id: 1, label: 'ANALYZE',  icon: BarChart3, description: 'market intelligence' },
  { id: 2, label: 'GENERATE', icon: Sparkles,  description: 'agent swarm working' },
  { id: 3, label: 'REVIEW',   icon: Eye,       description: 'user reviews outputs' },
  { id: 4, label: 'DEPLOY',   icon: Rocket,    description: 'deploy to BSC'       },
  { id: 5, label: 'EMPIRE',   icon: Crown,     description: 'live monitoring'     },
]

function getStepState(
  stepId: number,
  currentPhase: CurrentPhase,
): 'complete' | 'active' | 'future' {
  switch (currentPhase) {
    case 'building':
      if (stepId < 2)  return 'complete'
      if (stepId === 2) return 'active'
      return 'future'
    case 'review':
      if (stepId < 3)  return 'complete'
      if (stepId === 3) return 'active'
      return 'future'
    case 'deploying':
      if (stepId < 4)  return 'complete'
      if (stepId === 4) return 'active'
      return 'future'
    case 'deployed':
      if (stepId <= 4) return 'complete'
      return 'future'
    case 'empire':
      return 'complete'
  }
}

function getLineState(
  afterStepId: number,
  currentPhase: CurrentPhase,
): 'complete' | 'partial' | 'future' {
  const nextStep = afterStepId + 1
  const nextState = getStepState(nextStep, currentPhase)
  const thisState = getStepState(afterStepId, currentPhase)

  if (thisState === 'complete' && nextState === 'complete') return 'complete'
  if (thisState === 'complete' && nextState === 'active')   return 'partial'
  return 'future'
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full px-2 py-1.5">
      {PHASES.map((phase, index) => {
        const state = getStepState(phase.id, currentPhase)
        const Icon = phase.icon
        const isLast = index === PHASES.length - 1

        return (
          <div key={phase.id} className="flex items-center flex-1 min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <StepCircle state={state} Icon={Icon} />
              <span
                className={[
                  'font-mono text-[9px] tracking-widest leading-none select-none',
                  state === 'complete' ? 'text-[#00e5ff]' :
                  state === 'active'   ? 'text-[#f59e0b]' :
                                         'text-memeos-text-muted',
                ].join(' ')}
              >
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 h-px mx-1 relative overflow-hidden min-w-[8px]">
                <ConnectorLine lineState={getLineState(phase.id, currentPhase)} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface StepCircleProps {
  state: 'complete' | 'active' | 'future'
  Icon: React.ElementType
}

function StepCircle({ state, Icon }: StepCircleProps) {
  if (state === 'complete') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#00e5ff' }}
      >
        <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
      </motion.div>
    )
  }

  if (state === 'active') {
    return (
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: '#f59e0b' }}
          animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Circle */}
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="relative w-7 h-7 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)' }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} strokeWidth={2} />
        </motion.div>
      </div>
    )
  }

  // future
  return (
    <div
      className="w-7 h-7 rounded-full border flex items-center justify-center border-memeos-border"
      style={{ backgroundColor: 'transparent' }}
    >
      <Icon className="w-3.5 h-3.5 text-memeos-text-dim" strokeWidth={1.5} />
    </div>
  )
}

interface ConnectorLineProps {
  lineState: 'complete' | 'partial' | 'future'
}

function ConnectorLine({ lineState }: ConnectorLineProps) {
  if (lineState === 'complete') {
    return (
      <motion.div
        className="absolute inset-0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          transformOrigin: 'left center',
          background: 'linear-gradient(to right, #00e5ff, #8b5cf6)',
        }}
      />
    )
  }

  if (lineState === 'partial') {
    return (
      <>
        <motion.div
          className="absolute inset-0"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0.5 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            transformOrigin: 'left center',
            background: 'linear-gradient(to right, #00e5ff, #8b5cf6)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ left: '50%', backgroundColor: 'var(--memeos-border, #2a2a3a)' }}
        />
      </>
    )
  }

  // future
  return (
    <div
      className="absolute inset-0 border-memeos-border"
      style={{ backgroundColor: 'var(--memeos-border, #2a2a3a)' }}
    />
  )
}
