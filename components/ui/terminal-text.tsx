'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface TerminalTextProps {
  lines: Array<{ id: string; text: string; color?: string }>
  className?: string
}

export function TerminalText({ lines, className = '' }: TerminalTextProps) {
  return (
    <div className={`font-mono text-sm space-y-1 ${className}`}>
      <AnimatePresence mode="popLayout">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={line.color || 'text-memeos-cyan'}
          >
            <span className="text-memeos-text-muted mr-2">{'>'}</span>
            {line.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
