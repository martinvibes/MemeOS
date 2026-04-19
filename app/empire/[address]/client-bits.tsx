'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Copy, Check, ExternalLink, Share2, RefreshCw } from 'lucide-react'

/* -------------------- Copy address button -------------------- */

export function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy contract address"
      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-memeos-border hover:border-memeos-cyan/50 text-memeos-text-muted hover:text-memeos-cyan transition"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy
        </>
      )}
    </button>
  )
}

/* -------------------- Empire action buttons (share / remix / four.meme) -------------------- */

interface EmpireActionsProps {
  name: string
  symbol: string
  fourMemeUrl: string
  remixHref: string
  tagline?: string
}

export function EmpireActions({
  name,
  symbol,
  fourMemeUrl,
  remixHref,
  tagline,
}: EmpireActionsProps) {
  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `Check out $${symbol} on MemeOS: ${url}`
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <a
        href={fourMemeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-memeos-amber/40 bg-memeos-amber/10 text-memeos-amber hover:bg-memeos-amber/20 hover:shadow-glow-amber transition"
      >
        View on four.meme
        <ExternalLink className="w-3 h-3" />
      </a>

      <Link
        href={remixHref}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition"
      >
        <RefreshCw className="w-3 h-3" />
        Remix this
      </Link>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-memeos-violet/40 bg-memeos-violet/10 text-memeos-violet hover:bg-memeos-violet/20 hover:shadow-glow-violet transition"
      >
        <Share2 className="w-3 h-3" />
        Share on X
      </motion.button>

      {/* Unused prop (kept for future richer share copy) */}
      {tagline ? <span className="sr-only">{tagline}</span> : null}
      {name ? <span className="sr-only">{name}</span> : null}
    </div>
  )
}

/* -------------------- Tweet card -------------------- */

export function TweetCard({ tweet }: { tweet: string }) {
  const handleClick = () => {
    const text = `${tweet}\n\n#MemeOS #FourMeme`
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className="group relative text-left p-3 rounded-lg border border-memeos-border hover:border-memeos-cyan/50 bg-memeos-surface/40 hover:bg-memeos-surface transition-all"
    >
      <p className="text-sm text-memeos-text-dim group-hover:text-memeos-text whitespace-pre-wrap leading-relaxed">
        {tweet}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-memeos-border/50">
        <span className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider">
          Click to post
        </span>
        <Share2 className="w-3 h-3 text-memeos-text-muted group-hover:text-memeos-cyan transition" />
      </div>
    </motion.button>
  )
}
