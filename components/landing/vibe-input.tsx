'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlowButton } from '@/components/ui/glow-button'
import { GlassPanel } from '@/components/ui/glass-panel'

interface VibeInputProps {
  onSubmit: (prompt: string) => void
  loading?: boolean
}

const PLACEHOLDER_VIBES = [
  'aggressive cyber-duck with glitch energy, chaotic internet humor...',
  'zen samurai frog, ancient wisdom meets degen culture...',
  'neon-punk cat from the metaverse, dripping with swagger...',
  'cosmic doge philosopher, existential memes for enlightened degens...',
]

export function VibeInput({ onSubmit, loading }: VibeInputProps) {
  const [prompt, setPrompt] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_VIBES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (prompt.trim() && !loading) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto mt-12"
    >
      <GlassPanel glow="cyan" header="VIBE TERMINAL">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="font-mono text-memeos-cyan text-sm mt-1 select-none">{'>'}</span>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={PLACEHOLDER_VIBES[placeholderIndex]}
              rows={3}
              className="flex-1 bg-transparent font-mono text-sm text-memeos-text placeholder:text-memeos-text-muted/50 resize-none outline-none leading-relaxed"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-memeos-border">
            <span className="font-mono text-[10px] text-memeos-text-muted">
              {prompt.length > 0 ? `${prompt.length} chars` : 'describe your meme coin vibe'}
            </span>
            <GlowButton
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              loading={loading}
              size="md"
            >
              LAUNCH SEQUENCE
            </GlowButton>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  )
}
