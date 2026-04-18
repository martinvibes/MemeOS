'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: 'cyan' | 'violet' | 'amber' | 'emerald'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'cyan',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorMap = {
    cyan: 'bg-memeos-cyan',
    violet: 'bg-memeos-violet',
    amber: 'bg-memeos-amber',
    emerald: 'bg-memeos-emerald',
  }

  const glowMap = {
    cyan: 'shadow-[0_0_10px_rgba(0,229,255,0.4)]',
    violet: 'shadow-[0_0_10px_rgba(139,92,246,0.4)]',
    amber: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    emerald: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-xs text-memeos-text-dim uppercase">{label}</span>
          <span className="font-mono text-xs text-memeos-text">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 bg-memeos-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[color]} ${glowMap[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
