import { readDeploys, getBondingCurve, type StoredDeploy } from 'memeos-sdk'
import type { Address } from 'viem'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface EnrichedToken {
  name: string
  symbol: string
  tokenAddress: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  viralityScore?: number
  bondingCurveProgress: number
  deployedAt: string
}

type SortMode = 'virality' | 'bonding' | 'recent'

const RPC_CONCURRENCY_CAP = 20

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sortParam = (searchParams.get('sort') || 'virality') as SortMode
  const sort: SortMode =
    sortParam === 'bonding' || sortParam === 'recent' ? sortParam : 'virality'

  let deploys: StoredDeploy[] = []
  try {
    deploys = await readDeploys()
  } catch (err) {
    console.error('[leaderboard] readDeploys failed:', err)
    return Response.json({ tokens: [], total: 0 })
  }

  if (deploys.length === 0) {
    return Response.json({ tokens: [], total: 0 })
  }

  // Only fetch bonding curve for the first N tokens to avoid RPC overwhelm.
  const capped = deploys.slice(0, RPC_CONCURRENCY_CAP)

  const bondingResults = await Promise.allSettled(
    capped.map((d) => getBondingCurve(d.tokenAddress as Address))
  )

  const enriched: EnrichedToken[] = capped.map((d, idx) => {
    const result = bondingResults[idx]
    const progress =
      result.status === 'fulfilled' ? result.value.progressPercent : 0
    return {
      name: d.name,
      symbol: d.symbol,
      tokenAddress: d.tokenAddress,
      fourMemeUrl: d.fourMemeUrl,
      imageUrl: d.imageUrl,
      tagline: d.tagline,
      viralityScore: d.viralityScore,
      bondingCurveProgress: progress,
      deployedAt: d.deployedAt,
    }
  })

  // Also include any remaining tokens (beyond cap) with progress 0
  for (let i = RPC_CONCURRENCY_CAP; i < deploys.length; i++) {
    const d = deploys[i]
    enriched.push({
      name: d.name,
      symbol: d.symbol,
      tokenAddress: d.tokenAddress,
      fourMemeUrl: d.fourMemeUrl,
      imageUrl: d.imageUrl,
      tagline: d.tagline,
      viralityScore: d.viralityScore,
      bondingCurveProgress: 0,
      deployedAt: d.deployedAt,
    })
  }

  // Sort always descending
  enriched.sort((a, b) => {
    if (sort === 'bonding') {
      return b.bondingCurveProgress - a.bondingCurveProgress
    }
    if (sort === 'recent') {
      return new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
    }
    // virality (default)
    const av = a.viralityScore ?? -1
    const bv = b.viralityScore ?? -1
    return bv - av
  })

  return Response.json({ tokens: enriched, total: enriched.length })
}
