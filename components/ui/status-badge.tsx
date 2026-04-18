'use client'

import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: 'idle' | 'running' | 'completed' | 'error'
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = {
    idle: { color: 'bg-memeos-text-muted', text: 'text-memeos-text-dim', label: label || 'Idle' },
    running: { color: 'bg-memeos-amber', text: 'text-memeos-amber', label: label || 'Running' },
    completed: { color: 'bg-memeos-emerald', text: 'text-memeos-emerald', label: label || 'Complete' },
    error: { color: 'bg-memeos-red', text: 'text-memeos-red', label: label || 'Error' },
  }

  const c = config[status]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${c.color}`} />
        {status === 'running' && (
          <motion.div
            className={`absolute inset-0 w-2 h-2 rounded-full ${c.color}`}
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>
      <span className={`font-mono text-xs uppercase tracking-wider ${c.text}`}>
        {c.label}
      </span>
    </div>
  )
}
