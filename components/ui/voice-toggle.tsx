'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isVoiceEnabled, setVoiceEnabled } from '@/lib/voice'

/**
 * VoiceToggle — a compact button for the top nav that enables/disables
 * agent voice narration (Web Speech API).
 *
 * - Hydrates state from localStorage on mount (client-only)
 * - Hides itself on browsers without speechSynthesis support
 */
export function VoiceToggle() {
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') {
      setSupported(false)
      return
    }
    setEnabled(isVoiceEnabled())
  }, [])

  if (!mounted || !supported) return null

  const handleToggle = () => {
    const next = !enabled
    setVoiceEnabled(next)
    setEnabled(next)
  }

  return (
    <button
      onClick={handleToggle}
      title="Toggle agent voice"
      aria-label="Toggle agent voice"
      aria-pressed={enabled}
      className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
        enabled
          ? 'border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan'
          : 'border-memeos-border bg-memeos-surface/40 text-memeos-text-muted hover:text-memeos-cyan hover:border-memeos-cyan/30'
      }`}
    >
      {enabled ? (
        <Volume2 className="w-3.5 h-3.5" />
      ) : (
        <VolumeX className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">Voice</span>
    </button>
  )
}
