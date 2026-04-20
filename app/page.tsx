'use client'

import { Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Terminal, Trophy, Package } from 'lucide-react'
import { Hero } from '@/components/landing/hero'
import { VibeInput } from '@/components/landing/vibe-input'
import { DeployHistory } from '@/components/landing/deploy-history'
import { PersonalityPicker } from '@/components/landing/personality-picker'
import { VoiceToggle } from '@/components/ui/voice-toggle'
import { useStore } from '@/lib/store'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/>
    </svg>
  )
}

const Hyperspeed = dynamic(() => import('@/components/ui/Hyperspeed'), { ssr: false })

function VibeInputWithRemix({ onSubmit }: { onSubmit: (p: string) => void }) {
  const searchParams = useSearchParams()
  const remixSeed = searchParams.get('remix') || ''
  return <VibeInput onSubmit={onSubmit} initialValue={remixSeed} isRemix={!!remixSeed} />
}

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
          <div className="flex items-center gap-2">
            <VoiceToggle />
            <a
              href="https://www.npmjs.com/package/memeos-sdk"
              target="_blank"
              rel="noopener noreferrer"
              title="memeos-sdk on npm"
              className="hidden sm:flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-emerald/40 bg-memeos-emerald/10 text-memeos-emerald hover:bg-memeos-emerald/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
            >
              <Package className="w-3.5 h-3.5" />
              npm
            </a>
            <a
              href="https://github.com/martinvibes/MemeOS"
              target="_blank"
              rel="noopener noreferrer"
              title="MemeOS on GitHub"
              className="hidden sm:flex items-center justify-center p-1.5 rounded-lg border border-memeos-border hover:border-memeos-cyan/40 hover:text-memeos-cyan text-memeos-text-muted transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 hover:shadow-glow-cyan transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              How it works
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <Hero />
        <Suspense fallback={<VibeInput onSubmit={handleSubmit} />}>
          <VibeInputWithRemix onSubmit={handleSubmit} />
        </Suspense>
        <PersonalityPicker />
        <DeployHistory />

        <div className="text-center mt-8 space-y-3">
          <p className="font-mono text-[10px] text-memeos-text-muted">
            POWERED BY CLAUDE AI × FOUR.MEME × BITQUERY × BSC
          </p>
          <div className="flex items-center justify-center gap-3 font-mono text-[10px] text-memeos-text-muted">
            <a
              href="https://www.npmjs.com/package/memeos-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-memeos-emerald transition-colors"
            >
              <Package className="w-3 h-3" />
              npm install memeos-sdk
            </a>
            <span className="text-memeos-border">·</span>
            <a
              href="https://github.com/martinvibes/MemeOS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-memeos-cyan transition-colors"
            >
              <GithubIcon className="w-3 h-3" />
              Source
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
