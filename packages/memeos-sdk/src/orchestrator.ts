import Anthropic from '@anthropic-ai/sdk'
import { ConceptArchitect } from './agents/concept-architect'
import { MarketAnalyst } from './agents/market-analyst'
import { NarrativeDesigner } from './agents/narrative-designer'
import { VisualDirector } from './agents/visual-director'
import { LaunchCommander } from './agents/launch-commander'
import { BitqueryClient } from './bitquery/client'
import {
  getBondingCurve,
  getRecentTrades,
  getTopHolders,
  type BondingCurveData,
  type HolderInfo,
  type TradeLog,
} from './bsc/rpc'
import { readDeploys, writeDeploy, findDeploy, type StoredDeploy } from './storage/deploys'
import type {
  LaunchOptions, AgentEvent, ConceptBrief, MarketIntel,
  NarrativePackage, VisualAssets, DeployResult,
} from './types'
import type { PersonalityMode } from './personality/modes'
import type { Address } from 'viem'

const MAX_CRITIQUE_ROUNDS = 2
const CRITIQUE_THRESHOLD = 7

// ── Types ──────────────────────────────────────────────────────────────────

export interface GenerateResult {
  concept: ConceptBrief
  narrative: NarrativePackage
  image: VisualAssets
  market: MarketIntel
}

export interface ViralityResult {
  score: number
  breakdown: { naming: number; visual: number; narrative: number; timing: number }
  verdict: string
  riskFlags: string[]
}

export interface Empire {
  token: DeployResult
  concept: ConceptBrief
  narrative: NarrativePackage
  image: VisualAssets
  market: MarketIntel
  virality?: ViralityResult
}

export interface DeployOptions {
  concept: ConceptBrief
  narrative: NarrativePackage
  visuals: VisualAssets
  preSale?: string
  twitterUrl?: string
  telegramUrl?: string
  webUrl?: string
  onAgentUpdate?: (event: AgentEvent) => void
}

export interface LaunchConfig extends Omit<LaunchOptions, 'onAgentUpdate'> {
  onAgentUpdate?: (event: AgentEvent) => void
  personality?: PersonalityMode
  computeVirality?: boolean  // default true
  persist?: boolean           // default true — writes to global store
}

export interface MonitorOptions {
  onTrade?: (trade: TradeLog) => void
  onBondingUpdate?: (data: BondingCurveData) => void
  onHolderChange?: (holders: HolderInfo[]) => void
  pollIntervalMs?: number // default 5000
}

export interface MonitorHandle {
  stop: () => void
}

export interface MemeOSConfig {
  anthropicKey: string
  privateKey: string
  bscRpcUrl?: string      // default https://bsc-dataseed.binance.org
  bitqueryKey?: string    // optional — enables market intel
  upstashRedisUrl?: string   // optional — enables persistent global feed
  upstashRedisToken?: string // optional — paired with url
}

// ── Main SDK class ─────────────────────────────────────────────────────────

export class MemeOS {
  readonly anthropicKey: string
  readonly privateKey: string
  readonly bscRpcUrl: string
  readonly bitqueryKey: string

  constructor(config: MemeOSConfig) {
    if (!config.anthropicKey) throw new Error('MemeOS: anthropicKey is required')
    if (!config.privateKey) throw new Error('MemeOS: privateKey is required')

    this.anthropicKey = config.anthropicKey
    this.privateKey = config.privateKey
    this.bscRpcUrl = config.bscRpcUrl || 'https://bsc-dataseed.binance.org'
    this.bitqueryKey = config.bitqueryKey || ''

    // Wire Upstash env vars if provided (the storage module reads from process.env)
    if (config.upstashRedisUrl) {
      process.env.UPSTASH_REDIS_REST_URL = config.upstashRedisUrl
    }
    if (config.upstashRedisToken) {
      process.env.UPSTASH_REDIS_REST_TOKEN = config.upstashRedisToken
    }
  }

  // ── generate(): run the agent swarm, no deploy ──────────────────────────

  async generate(
    vibePrompt: string,
    onAgentUpdate?: (event: AgentEvent) => void,
    personality: PersonalityMode = 'balanced',
  ): Promise<GenerateResult> {
    onAgentUpdate?.({
      agent: 'visual-director',
      status: 'running',
      message: 'Preparing image variants from vibe...',
      timestamp: Date.now(),
    })

    const prelimImagePrompt = `${vibePrompt}, high quality digital art, token logo style, centered character on dark background, bold vibrant colors, icon style, no text`
    const prelimEncoded = encodeURIComponent(prelimImagePrompt)
    const buildUrl = (seed: number) =>
      `https://image.pollinations.ai/prompt/${prelimEncoded}?width=512&height=512&model=flux&seed=${seed}&nologo=true`

    const prelimImage = { url: buildUrl(1000), localPath: '', prompt: prelimImagePrompt }
    const secondImage = { url: buildUrl(2000), localPath: '', prompt: prelimImagePrompt }

    const marketAnalyst = new MarketAnalyst(
      this.anthropicKey,
      this.bitqueryKey,
      onAgentUpdate,
      personality,
    )
    const marketIntel = await marketAnalyst.run()

    const conceptArchitect = new ConceptArchitect(this.anthropicKey, onAgentUpdate, personality)
    const concept = await conceptArchitect.run({ vibePrompt, marketIntel })

    const visualDirector = new VisualDirector(this.anthropicKey, onAgentUpdate, personality)
    const narrativeDesigner = new NarrativeDesigner(this.anthropicKey, onAgentUpdate, personality)

    const visualsPromise = visualDirector.generateVisuals(concept, prelimImage, secondImage)
    let narrative = await narrativeDesigner.run({ concept, marketIntel })
    const visuals = await visualsPromise

    // Critique loop
    let critiqueRound = 0
    while (critiqueRound < MAX_CRITIQUE_ROUNDS) {
      const critique = await visualDirector.critiqueNarrative(narrative, concept)
      visuals.coherenceScore = critique.coherenceScore
      if (critique.coherenceScore >= CRITIQUE_THRESHOLD || !critique.revisionNotes) break

      onAgentUpdate?.({
        agent: 'visual-director',
        status: 'running',
        message: `Requesting revision (round ${critiqueRound + 1}/${MAX_CRITIQUE_ROUNDS}): ${critique.revisionNotes}`,
        timestamp: Date.now(),
      })

      narrative = await narrativeDesigner.run({ concept, marketIntel, revisionNotes: critique.revisionNotes })
      critiqueRound++
    }

    return { concept, narrative, image: visuals, market: marketIntel }
  }

  // ── deploy(): execute on-chain deployment ──────────────────────────────

  async deploy(options: DeployOptions): Promise<DeployResult> {
    const launchCommander = new LaunchCommander(this.anthropicKey, options.onAgentUpdate)

    return launchCommander.run({
      concept: options.concept,
      narrative: options.narrative,
      visuals: options.visuals,
      config: {
        privateKey: this.privateKey,
        bscRpcUrl: this.bscRpcUrl,
      },
      options: {
        preSale: options.preSale,
        twitterUrl: options.twitterUrl,
        telegramUrl: options.telegramUrl,
        webUrl: options.webUrl,
      },
    })
  }

  // ── launch(): full pipeline in one call ─────────────────────────────────

  async launch(vibePrompt: string, config: LaunchConfig = {}): Promise<Empire> {
    const {
      onAgentUpdate,
      personality = 'balanced',
      computeVirality = true,
      persist = true,
      preSale,
      twitterUrl,
      telegramUrl,
      webUrl,
    } = config

    const generated = await this.generate(vibePrompt, onAgentUpdate, personality)

    let virality: ViralityResult | undefined
    if (computeVirality) {
      virality = await this.getVirality(generated).catch(() => undefined)
    }

    const deployResult = await this.deploy({
      concept: generated.concept,
      narrative: generated.narrative,
      visuals: generated.image,
      preSale,
      twitterUrl,
      telegramUrl,
      webUrl,
      onAgentUpdate,
    })

    if (persist) {
      await writeDeploy({
        name: deployResult.name,
        symbol: deployResult.symbol,
        tokenAddress: deployResult.tokenAddress,
        txHash: deployResult.txHash,
        fourMemeUrl: deployResult.fourMemeUrl,
        imageUrl: generated.image.imageUrl,
        tagline: generated.narrative.taglines?.[0],
        lore: generated.narrative.lore,
        tweets: generated.narrative.tweets,
        personality: generated.concept.personality,
        vibePrompt,
        viralityScore: virality?.score,
        viralityBreakdown: virality?.breakdown,
        deployedAt: new Date().toISOString(),
      }).catch((e) => console.error('[MemeOS] writeDeploy failed:', e))
    }

    return {
      token: deployResult,
      concept: generated.concept,
      narrative: generated.narrative,
      image: generated.image,
      market: generated.market,
      virality,
    }
  }

  // ── getVirality(): score a generated concept ────────────────────────────

  async getVirality(generated: GenerateResult): Promise<ViralityResult> {
    const client = new Anthropic({ apiKey: this.anthropicKey, timeout: 60_000, maxRetries: 2 })

    const topName = generated.concept.names?.[0]
    const topNames = generated.market?.topTokens?.slice(0, 5)
      .map((t: any) => `${t.name} ($${t.symbol}) - $${Math.round(t.volume24h || 0)} vol`)
      .join(', ') || 'no market data'

    const systemPrompt = `You are the Virality Analyst of MemeOS. You predict how well a meme coin will perform based on its identity and current market conditions.

Output ONLY valid JSON:
{
  "score": 78,
  "breakdown": { "naming": 85, "visual": 72, "narrative": 80, "timing": 75 },
  "verdict": "Strong contender — naming resonates with current trends.",
  "riskFlags": ["Name may conflict with existing token"]
}

Scoring (each 0-100): naming memorability, visual distinctiveness, narrative shareability, market timing. Overall score is a weighted average with realistic variance.`

    const userPrompt = `CONCEPT: ${topName?.name} ($${topName?.ticker})
Personality: ${generated.concept.personality?.join(', ')}
Visual Direction: ${generated.concept.visualDirection}

NARRATIVE:
Lore: ${generated.narrative.lore?.slice(0, 500)}
Taglines: ${generated.narrative.taglines?.join(' | ')}

MARKET:
Top performers: ${topNames}
Trend signals: ${generated.market?.trendSignals?.join(', ') || 'unknown'}

Score this concept for viral potential.`

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 70,
        breakdown: { naming: 70, visual: 70, narrative: 70, timing: 70 },
        verdict: 'Analysis unavailable — using neutral baseline.',
        riskFlags: [],
      }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      score: parsed.score || 70,
      breakdown: parsed.breakdown || { naming: 70, visual: 70, narrative: 70, timing: 70 },
      verdict: parsed.verdict || '',
      riskFlags: parsed.riskFlags || [],
    }
  }

  // ── monitor(): live on-chain monitoring of a deployed token ─────────────

  monitor(tokenAddress: string, options: MonitorOptions = {}): MonitorHandle {
    const addr = tokenAddress as Address
    const interval = options.pollIntervalMs || 5000

    let stopped = false
    let lastBlock: bigint | undefined = undefined
    const seen = new Set<string>()

    const tick = async () => {
      if (stopped) return
      try {
        const [bonding, { trades, latestBlock }] = await Promise.all([
          getBondingCurve(addr),
          getRecentTrades(addr, lastBlock),
        ])

        options.onBondingUpdate?.(bonding)

        for (const trade of trades) {
          const key = `${trade.txHash}-${trade.buyer}`
          if (!seen.has(key)) {
            seen.add(key)
            options.onTrade?.(trade)
          }
        }

        if (latestBlock > 0n) lastBlock = latestBlock + 1n
      } catch (err) {
        console.error('[MemeOS.monitor] tick failed:', err)
      }
    }

    const tickHolders = async () => {
      if (stopped) return
      try {
        const holders = await getTopHolders(addr, 10)
        options.onHolderChange?.(holders)
      } catch (err) {
        console.error('[MemeOS.monitor] holders failed:', err)
      }
    }

    // initial + intervals
    tick()
    tickHolders()
    const tickInterval = setInterval(tick, interval)
    const holdersInterval = setInterval(tickHolders, Math.max(interval, 30_000))

    return {
      stop: () => {
        stopped = true
        clearInterval(tickInterval)
        clearInterval(holdersInterval)
      },
    }
  }

  // ── getRecentDeploys(): query the global store ──────────────────────────

  async getRecentDeploys(limit = 20): Promise<StoredDeploy[]> {
    const all = await readDeploys()
    return all.slice(0, limit)
  }

  async findDeploy(tokenAddress: string): Promise<StoredDeploy | null> {
    return findDeploy(tokenAddress)
  }

  // ── Bitquery convenience ────────────────────────────────────────────────

  bitquery(): BitqueryClient | null {
    if (!this.bitqueryKey) return null
    return new BitqueryClient(this.bitqueryKey)
  }
}
