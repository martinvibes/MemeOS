'use client'

import { GlassPanel } from '@/components/ui/glass-panel'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useStore } from '@/lib/store'

export function BondingCurve() {
  const progress = useStore((s) => s.bondingCurveProgress)

  return (
    <GlassPanel header="BONDING CURVE">
      <ProgressBar
        value={progress}
        max={100}
        label="Progress to Graduation"
        color={progress >= 95 ? 'emerald' : progress >= 50 ? 'amber' : 'cyan'}
      />
      <p className="font-mono text-[10px] text-memeos-text-muted mt-2 text-center">
        {progress >= 100
          ? 'Graduated to PancakeSwap!'
          : `${(100 - progress).toFixed(1)}% remaining to PancakeSwap migration`
        }
      </p>
    </GlassPanel>
  )
}
