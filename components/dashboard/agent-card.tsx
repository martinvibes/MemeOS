'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Dna,
  Palette,
  ScrollText,
  Rocket,
  type LucideIcon,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'

const AGENT_LABELS: Record<string, string> = {
  'market-analyst': 'MARKET ANALYST',
  'concept-architect': 'CONCEPT ARCHITECT',
  'visual-director': 'VISUAL DIRECTOR',
  'narrative-designer': 'NARRATIVE DESIGNER',
  'launch-commander': 'LAUNCH COMMANDER',
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  'market-analyst': BarChart3,
  'concept-architect': Dna,
  'visual-director': Palette,
  'narrative-designer': ScrollText,
  'launch-commander': Rocket,
}

interface AgentCardProps {
  agentId: string
  status: 'idle' | 'running' | 'completed' | 'error'
  messages: Array<{ id: string; text: string; timestamp: number }>
}

export function AgentCard({ agentId, status, messages }: AgentCardProps) {
  const lastMessages = messages.slice(-5)

  return (
    <motion.div
      layout
      className={`rounded-lg border p-3 transition-all duration-500 ${
        status === 'running' ? 'border-memeos-cyan/30 bg-memeos-cyan/5'
        : status === 'completed' ? 'border-memeos-emerald/20 bg-memeos-emerald/5'
        : status === 'error' ? 'border-memeos-red/20 bg-memeos-red/5'
        : 'border-memeos-border bg-memeos-surface/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = AGENT_ICONS[agentId]
            return Icon ? (
              <Icon className={`w-4 h-4 ${
                status === 'running' ? 'text-memeos-cyan' :
                status === 'completed' ? 'text-memeos-emerald' :
                status === 'error' ? 'text-memeos-red' :
                'text-memeos-text-muted'
              }`} />
            ) : null
          })()}
          <span className="font-mono text-xs text-memeos-text tracking-wider">
            {AGENT_LABELS[agentId] || agentId}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>
      <AnimatePresence mode="popLayout">
        {lastMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
            className="font-mono text-[11px] text-memeos-text-dim leading-relaxed pl-6 truncate"
          >
            <span className="text-memeos-text-muted mr-1">{'>'}</span>
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
