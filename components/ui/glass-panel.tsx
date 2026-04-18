'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'violet' | 'amber' | 'none'
  header?: string
  animate?: boolean
}

export function GlassPanel({
  children,
  className = '',
  glow = 'none',
  header,
  animate = true,
}: GlassPanelProps) {
  const glowStyles = {
    cyan: 'shadow-glow-cyan border-memeos-cyan/20',
    violet: 'shadow-glow-violet border-memeos-violet/20',
    amber: 'shadow-glow-amber border-memeos-amber/20',
    none: 'border-memeos-border',
  }

  const Wrapper = animate ? motion.div : 'div'
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {}

  return (
    <Wrapper
      className={`glass-panel holo-border ${glowStyles[glow]} ${className}`}
      {...(animateProps as any)}
    >
      {header && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-memeos-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-memeos-red/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-memeos-amber/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-memeos-emerald/70" />
          </div>
          <span className="font-mono text-xs text-memeos-text-dim uppercase tracking-wider ml-2">
            {header}
          </span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </Wrapper>
  )
}
