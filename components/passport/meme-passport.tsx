'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { GlowButton } from '@/components/ui/glow-button'
import { useStore } from '@/lib/store'

export function MemePassport() {
  const deployResult = useStore((s) => s.deployResult)
  const generated = useStore((s) => s.generated)
  const [downloading, setDownloading] = useState(false)

  if (!deployResult) return null

  const downloadPassport = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams({
        name: deployResult.name,
        ticker: deployResult.symbol,
        address: deployResult.tokenAddress,
        tagline: generated?.narrative?.taglines?.[0] || '',
        imageUrl: generated?.image?.imageUrl || '',
      })

      const response = await fetch(`/api/passport?${params}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `memeos-passport-${deployResult.symbol}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <GlassPanel header="MEME PASSPORT" glow="violet">
      <div className="text-center space-y-3">
        <p className="font-mono text-xs text-memeos-text-dim">
          Download your token&apos;s shareable passport card
        </p>
        <GlowButton variant="violet" onClick={downloadPassport} loading={downloading} className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Passport PNG
          </span>
        </GlowButton>
        <p className="font-mono text-[10px] text-memeos-text-muted flex items-center justify-center gap-1">
          <Share2 className="w-3 h-3" /> Optimized for X/Twitter — screenshot and share
        </p>
      </div>
    </GlassPanel>
  )
}
