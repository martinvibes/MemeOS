'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Target,
  Eye,
  ScrollText,
  Clock,
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'

// ─── Types ─────────────────────────────────────────────────────────────────

interface ViralityScoreProps {
  score: number
  breakdown: {
    naming: number
    visual: number
    narrative: number
    timing: number
  }
  verdict: string
  riskFlags: string[]
  loading?: boolean
}

type ScoreTier = {
  label: string
  accent: 'emerald' | 'cyan' | 'amber' | 'red'
  ringHex: string
  textClass: string
  bgClass: string
  shadowClass: string
  glowRgba: string
}

// ─── Tier Logic ────────────────────────────────────────────────────────────

function getTier(score: number): ScoreTier {
  if (score >= 85) {
    return {
      label: 'EXCELLENT',
      accent: 'emerald',
      ringHex: '#10f5a8',
      textClass: 'text-memeos-emerald',
      bgClass: 'bg-memeos-emerald/5',
      shadowClass: 'shadow-[0_0_40px_rgba(16,245,168,0.35)]',
      glowRgba: 'rgba(16,245,168,0.45)',
    }
  }
  if (score >= 70) {
    return {
      label: 'STRONG',
      accent: 'cyan',
      ringHex: '#00e5ff',
      textClass: 'text-memeos-cyan',
      bgClass: 'bg-memeos-cyan/5',
      shadowClass: 'shadow-[0_0_40px_rgba(0,229,255,0.35)]',
      glowRgba: 'rgba(0,229,255,0.45)',
    }
  }
  if (score >= 55) {
    return {
      label: 'FAIR',
      accent: 'amber',
      ringHex: '#ffb545',
      textClass: 'text-memeos-amber',
      bgClass: 'bg-memeos-amber/5',
      shadowClass: 'shadow-[0_0_40px_rgba(255,181,69,0.3)]',
      glowRgba: 'rgba(255,181,69,0.45)',
    }
  }
  return {
    label: 'WEAK',
    accent: 'red',
    ringHex: '#ff4d6d',
    textClass: 'text-memeos-red',
    bgClass: 'bg-memeos-red/5',
    shadowClass: 'shadow-[0_0_40px_rgba(255,77,109,0.3)]',
    glowRgba: 'rgba(255,77,109,0.45)',
  }
}

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedNumber({
  value,
  duration = 1.6,
  delay = 0,
  className = '',
}: {
  value: number
  duration?: number
  delay?: number
  className?: string
}) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v))
    const controls = animate(mv, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => {
      unsub()
      controls.stop()
    }
  }, [value, duration, delay, mv, rounded])

  return <span className={className}>{display}</span>
}

// ─── Score Ring ────────────────────────────────────────────────────────────

function ScoreRing({ score, tier }: { score: number; tier: ScoreTier }) {
  const size = 220
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer ambient glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: `radial-gradient(circle, ${tier.glowRgba} 0%, transparent 70%)` }}
      />

      {/* Rotating conic shimmer */}
      <motion.div
        aria-hidden
        className="absolute inset-2 rounded-full opacity-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${tier.ringHex}22 30%, transparent 60%, ${tier.ringHex}33 85%, transparent 100%)`,
        }}
      />

      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          <linearGradient id={`ring-gradient-${tier.accent}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.ringHex} stopOpacity="1" />
            <stop offset="100%" stopColor={tier.ringHex} stopOpacity="0.55" />
          </linearGradient>
          <filter id={`ring-glow-${tier.accent}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-gradient-${tier.accent})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          filter={`url(#ring-glow-${tier.accent})`}
        />

        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 360
          const rad = (angle * Math.PI) / 180
          const inner = radius + strokeWidth / 2 + 6
          const outer = inner + (i % 5 === 0 ? 6 : 3)
          const cx = size / 2
          const cy = size / 2
          const x1 = cx + Math.cos(rad) * inner
          const y1 = cy + Math.sin(rad) * inner
          const x2 = cx + Math.cos(rad) * outer
          const y2 = cy + Math.sin(rad) * outer
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tier.ringHex}
              strokeOpacity={i % 5 === 0 ? 0.35 : 0.12}
              strokeWidth={1}
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-memeos-text-muted mb-1"
        >
          Score
        </motion.div>
        <div className={`font-mono font-black leading-none ${tier.textClass}`} style={{ fontSize: '4.5rem', letterSpacing: '-0.04em' }}>
          <AnimatedNumber value={score} duration={1.8} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className={`mt-2 px-2.5 py-0.5 rounded-full border font-mono text-[10px] font-bold tracking-[0.2em] ${tier.textClass} border-current ${tier.bgClass}`}
        >
          {tier.label}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────────

function BreakdownBar({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string
  value: number
  icon: React.ElementType
  delay: number
}) {
  const tier = getTier(value)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={11} className={tier.textClass} />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-memeos-text-dim">
            {label}
          </span>
        </div>
        <div className={`font-mono text-xs font-bold ${tier.textClass}`}>
          <AnimatedNumber value={value} duration={1.2} delay={delay} />
          <span className="text-memeos-text-muted/60 ml-0.5">/100</span>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-memeos-surface/60 overflow-hidden border border-memeos-border/50">
        {/* Track shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

        {/* Filled portion */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${tier.ringHex}88 0%, ${tier.ringHex} 100%)`,
            boxShadow: `0 0 12px ${tier.ringHex}66, inset 0 0 6px ${tier.ringHex}44`,
          }}
        >
          {/* Moving highlight */}
          <motion.div
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '400%' }}
            transition={{ delay: delay + 1, duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Loading State ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <GlassPanel glow="violet" animate={false}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={15} className="text-memeos-violet animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-memeos-violet">
          Viral Potential
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-memeos-border to-transparent" />
      </div>

      <div className="flex flex-col items-center justify-center py-10 gap-5">
        {/* Spinning ring skeleton */}
        <div className="relative w-[140px] h-[140px] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-memeos-violet/30 border-t-memeos-violet"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border border-memeos-cyan/20 border-b-memeos-cyan/70"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
          <RefreshCw size={28} className="text-memeos-violet animate-spin" />
        </div>

        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="font-mono text-sm text-memeos-text-dim"
          >
            Analyzing viral potential...
          </motion.p>
          <p className="font-mono text-[10px] text-memeos-text-muted mt-1 tracking-wider">
            Cross-referencing market signals
          </p>
        </div>

        {/* Skeleton bars */}
        <div className="w-full max-w-sm space-y-3 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-2 w-16 rounded bg-memeos-surface/60 animate-pulse" />
                <div className="h-2 w-8 rounded bg-memeos-surface/60 animate-pulse" />
              </div>
              <motion.div
                className="h-2 rounded-full bg-memeos-surface/60 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-memeos-violet/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function ViralityScore({
  score,
  breakdown,
  verdict,
  riskFlags,
  loading = false,
}: ViralityScoreProps) {
  if (loading) return <LoadingState />

  const tier = getTier(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <GlassPanel glow={tier.accent === 'red' ? 'none' : tier.accent === 'emerald' ? 'cyan' : tier.accent} animate={false}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={15} className={tier.textClass} />
          </motion.div>
          <span className={`font-mono text-xs uppercase tracking-[0.18em] ${tier.textClass}`}>
            Viral Potential
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-memeos-border to-transparent" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-memeos-surface/40 border border-memeos-border">
            <TrendingUp size={10} className={tier.textClass} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-memeos-text-muted">
              Live Analysis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          {/* Ring - 2 cols */}
          <div className="md:col-span-2 flex justify-center">
            <ScoreRing score={score} tier={tier} />
          </div>

          {/* Verdict + Breakdown - 3 cols */}
          <div className="md:col-span-3 flex flex-col gap-5">
            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={`relative rounded-xl p-4 border ${tier.bgClass} border-current/20`}
              style={{ borderColor: `${tier.ringHex}33` }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                style={{ background: `linear-gradient(to bottom, ${tier.ringHex}, ${tier.ringHex}44, transparent)` }}
              />
              <div className="flex items-start gap-2">
                <span className={`font-mono text-xl leading-none ${tier.textClass} opacity-60`}>&ldquo;</span>
                <p className="font-mono text-sm leading-relaxed text-memeos-text flex-1">
                  {verdict}
                </p>
                <span className={`font-mono text-xl leading-none ${tier.textClass} opacity-60 self-end`}>&rdquo;</span>
              </div>
            </motion.div>

            {/* Breakdown */}
            <div className="space-y-3">
              <BreakdownBar label="Naming" value={breakdown.naming} icon={Target} delay={0.7} />
              <BreakdownBar label="Visual" value={breakdown.visual} icon={Eye} delay={0.8} />
              <BreakdownBar label="Narrative" value={breakdown.narrative} icon={ScrollText} delay={0.9} />
              <BreakdownBar label="Timing" value={breakdown.timing} icon={Clock} delay={1.0} />
            </div>
          </div>
        </div>

        {/* Risk Flags */}
        {riskFlags && riskFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-6 pt-5 border-t border-memeos-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={11} className="text-memeos-amber" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-memeos-amber">
                Risk Signals ({riskFlags.length})
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-memeos-amber/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {riskFlags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + i * 0.08, duration: 0.3 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-memeos-amber/5 border border-memeos-amber/20"
                >
                  <AlertTriangle size={12} className="text-memeos-amber shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed text-memeos-text-dim">
                    {flag}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </GlassPanel>
    </motion.div>
  )
}
