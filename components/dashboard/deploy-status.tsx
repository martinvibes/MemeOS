'use client'

import { ExternalLink, FileCode, Crown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { useStore } from '@/lib/store'
import { formatAddress } from '@/lib/utils'
import { GlowButton } from '@/components/ui/glow-button'

export function DeployStatus() {
  const deployResult = useStore((s) => s.deployResult)
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const error = useStore((s) => s.error)

  return (
    <GlassPanel header="DEPLOY STATUS" glow={deployResult ? 'cyan' : 'none'}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-memeos-text-muted">Chain</span>
          <span className="font-mono text-xs text-memeos-text">BSC Mainnet</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-memeos-text-muted">Platform</span>
          <span className="font-mono text-xs text-memeos-text">four.meme</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-memeos-text-muted">Status</span>
          <span className={`font-mono text-xs flex items-center gap-1.5 ${
            error ? 'text-memeos-red' :
            deployResult ? 'text-memeos-emerald' :
            phase === 'deploying' ? 'text-memeos-amber' :
            'text-memeos-text-dim'
          }`}>
            {error ? (
              <><AlertCircle className="w-3 h-3" /> Error</>
            ) : deployResult ? (
              <><CheckCircle2 className="w-3 h-3" /> Deployed</>
            ) : phase === 'deploying' ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Deploying...</>
            ) : 'Idle'}
          </span>
        </div>

        {deployResult && (
          <>
            <div className="border-t border-memeos-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-memeos-text-muted flex items-center gap-1.5">
                  <FileCode className="w-3 h-3" /> Contract
                </span>
                <a href={`https://bscscan.com/address/${deployResult.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-memeos-cyan hover:underline flex items-center gap-1">
                  {formatAddress(deployResult.tokenAddress)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-memeos-text-muted">TX</span>
                <a href={`https://bscscan.com/tx/${deployResult.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-memeos-cyan hover:underline flex items-center gap-1">
                  {formatAddress(deployResult.txHash)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <a href={deployResult.fourMemeUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-memeos-violet hover:underline flex items-center gap-1">
                View on four.meme
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <GlowButton variant="violet" size="sm" className="w-full mt-2" onClick={() => setPhase('empire')}>
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" /> Enter Empire Mode
              </span>
            </GlowButton>
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 font-mono text-xs text-memeos-red bg-memeos-red/10 rounded p-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
