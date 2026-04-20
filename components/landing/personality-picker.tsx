'use client'

import { motion } from 'framer-motion'
import { Flame, Leaf, Zap, Skull, Palette, CircleDot } from 'lucide-react'
import { useStore } from '@/lib/store'
import { PERSONALITY_MODES, type PersonalityMode } from 'memeos-sdk/personality/modes'

const MODE_ICONS: Record<PersonalityMode, typeof Flame> = {
  balanced: CircleDot,
  aggressive: Flame,
  zen: Leaf,
  chaotic: Zap,
  degen: Skull,
  aesthetic: Palette,
}

const ACCENT_MAP: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: {
    border: 'border-memeos-cyan',
    bg: 'bg-memeos-cyan/10',
    text: 'text-memeos-cyan',
    glow: 'shadow-[0_0_14px_rgba(0,229,255,0.25)]',
  },
  violet: {
    border: 'border-memeos-violet',
    bg: 'bg-memeos-violet/10',
    text: 'text-memeos-violet',
    glow: 'shadow-[0_0_14px_rgba(139,92,246,0.25)]',
  },
  amber: {
    border: 'border-memeos-amber',
    bg: 'bg-memeos-amber/10',
    text: 'text-memeos-amber',
    glow: 'shadow-[0_0_14px_rgba(245,158,11,0.25)]',
  },
  emerald: {
    border: 'border-memeos-emerald',
    bg: 'bg-memeos-emerald/10',
    text: 'text-memeos-emerald',
    glow: 'shadow-[0_0_14px_rgba(16,185,129,0.25)]',
  },
  red: {
    border: 'border-memeos-red',
    bg: 'bg-memeos-red/10',
    text: 'text-memeos-red',
    glow: 'shadow-[0_0_14px_rgba(239,68,68,0.25)]',
  },
}

const MODE_ORDER: PersonalityMode[] = ['balanced', 'aggressive', 'zen', 'chaotic', 'degen', 'aesthetic']

export function PersonalityPicker() {
  const personality = useStore((s) => s.personality)
  const setPersonality = useStore((s) => s.setPersonality)
  const current = PERSONALITY_MODES[personality]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mt-6"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest">
          Swarm Personality
        </span>
        <span className={`font-mono text-[10px] tracking-wider ${ACCENT_MAP[current.accent].text}`}>
          {current.tagline}
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {MODE_ORDER.map((mode) => {
          const info = PERSONALITY_MODES[mode]
          const Icon = MODE_ICONS[mode]
          const isActive = personality === mode
          const a = ACCENT_MAP[info.accent]

          return (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPersonality(mode)}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-2 px-1
                rounded-lg border font-mono text-[10px] uppercase tracking-widest transition-all
                ${isActive
                  ? `${a.border} ${a.bg} ${a.text} ${a.glow}`
                  : 'border-memeos-border/60 bg-memeos-surface/30 text-memeos-text-muted hover:border-memeos-border'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="leading-none">{info.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
