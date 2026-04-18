'use client'

import { Cpu, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { useStore } from '@/lib/store'

export function MissionControl() {
  const generated = useStore((s) => s.generated)
  const deployResult = useStore((s) => s.deployResult)
  const phase = useStore((s) => s.phase)
  const selectedNameIndex = useStore((s) => s.selectedNameIndex)

  const concept = generated?.concept
  const narrative = generated?.narrative
  const image = generated?.image
  const tokenName = concept?.names?.[selectedNameIndex]

  return (
    <GlassPanel header="MISSION CONTROL" glow="violet" className="h-full">
      <div className="space-y-4">
        {/* Token Preview */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl border border-memeos-border bg-memeos-surface flex items-center justify-center overflow-hidden flex-shrink-0">
            {image?.imageUrl ? (
              <img
                src={image.imageUrl}
                alt="Token"
                width={80}
                height={80}
                className="rounded-xl object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                {phase === 'building' ? (
                  <Loader2 className="w-5 h-5 text-memeos-text-muted animate-spin" />
                ) : (
                  <Cpu className="w-5 h-5 text-memeos-text-muted" />
                )}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-mono text-lg text-memeos-cyan truncate">
              {deployResult?.name || tokenName?.name || (phase === 'building' ? 'Generating...' : 'Awaiting vibe')}
            </h3>
            <p className="font-mono text-sm text-memeos-violet">
              {deployResult?.symbol ? `$${deployResult.symbol}` : tokenName?.ticker ? `$${tokenName.ticker}` : ''}
            </p>
            {narrative?.taglines?.[0] && (
              <p className="font-sans text-xs text-memeos-text-dim mt-1 italic">
                &ldquo;{narrative.taglines[0]}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Lore Preview */}
        {narrative?.lore && (
          <div className="border-t border-memeos-border pt-3">
            <h4 className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider mb-2">Lore</h4>
            <p className="font-sans text-xs text-memeos-text-dim leading-relaxed line-clamp-4">
              {narrative.lore}
            </p>
          </div>
        )}

        {/* Tweets Preview */}
        {narrative?.tweets && narrative.tweets.length > 0 && (
          <div className="border-t border-memeos-border pt-3">
            <h4 className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider mb-2">Ready-to-Post</h4>
            <div className="space-y-2">
              {narrative.tweets.slice(0, 2).map((tweet, i) => (
                <p key={i} className="font-sans text-[11px] text-memeos-text-dim bg-memeos-surface rounded p-2">
                  {tweet}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
