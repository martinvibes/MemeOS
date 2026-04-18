'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface GlowButtonProps {
  children: ReactNode
  variant?: 'cyan' | 'violet' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function GlowButton({
  children,
  variant = 'cyan',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  onClick,
}: GlowButtonProps) {
  const variants = {
    cyan: 'bg-memeos-cyan/10 border-memeos-cyan/40 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan',
    violet: 'bg-memeos-violet/10 border-memeos-violet/40 text-memeos-violet hover:bg-memeos-violet/20 hover:shadow-glow-violet',
    amber: 'bg-memeos-amber/10 border-memeos-amber/40 text-memeos-amber hover:bg-memeos-amber/20 hover:shadow-glow-amber',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        font-mono uppercase tracking-wider border rounded-lg
        transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          Processing...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
