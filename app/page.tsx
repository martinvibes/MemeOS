'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Terminal } from 'lucide-react'
import { Hero } from '@/components/landing/hero'
import { VibeInput } from '@/components/landing/vibe-input'
import { DeployHistory } from '@/components/landing/deploy-history'
import { useStore } from '@/lib/store'

const Hyperspeed = dynamic(() => import('@/components/ui/Hyperspeed'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const { setVibePrompt, setPhase } = useStore()

  const handleSubmit = (prompt: string) => {
    setVibePrompt(prompt)
    setPhase('building')
    router.push('/dashboard')
  }

  const hyperspeedOptions = useMemo(() => ({
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion' as const,
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
    carLightsRadius: [0.05, 0.14] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
      leftCars: [0x00e5ff, 0x8b5cf6, 0x00e5ff],
      rightCars: [0x8b5cf6, 0x6d28d9, 0x324555],
      sticks: 0x00e5ff,
    },
  }), [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      {/* Hyperspeed WebGL background */}
      <div className="absolute inset-0 opacity-80">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Dark overlay for readability — light enough to let the highway show */}
      <div className="absolute inset-0 bg-gradient-to-t from-memeos-bg/70 via-memeos-bg/50 to-transparent pointer-events-none" />

      {/* Fixed top nav — always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-memeos-border/50 bg-memeos-bg/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-memeos-cyan" />
            <span className="font-mono text-memeos-cyan text-sm font-bold tracking-wider">MEMEOS</span>
            <span className="font-mono text-[9px] text-memeos-text-muted bg-memeos-surface px-1.5 py-0.5 rounded border border-memeos-border">
              v1.0
            </span>
          </div>
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            How it works
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <Hero />
        <VibeInput onSubmit={handleSubmit} />
        <DeployHistory />

        <p className="text-center font-mono text-[10px] text-memeos-text-muted mt-8">
          POWERED BY CLAUDE AI × FOUR.MEME × BITQUERY × BSC
        </p>
      </div>
    </main>
  )
}
