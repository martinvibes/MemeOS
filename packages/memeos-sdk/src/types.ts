// === Agent System Types ===

export type AgentName =
  | 'concept-architect'
  | 'market-analyst'
  | 'narrative-designer'
  | 'visual-director'
  | 'launch-commander'

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'

export interface AgentEvent {
  agent: AgentName
  status: AgentStatus
  message: string
  data?: unknown
  timestamp: number
}

// === Concept Architect Output ===

export interface ConceptBrief {
  names: Array<{ name: string; ticker: string; reasoning: string }>
  personality: string[]
  visualDirection: string
  audienceProfile: string
  narrativeHooks: string[]
  humorStyle: string
}

// === Market Analyst Output ===

export interface TokenSummary {
  name: string
  symbol: string
  address: string
  volume24h: number
  buyers24h: number
  priceUSD: number
}

export interface MarketIntel {
  topTokens: TokenSummary[]
  trendSignals: string[]
  namingPatterns: string[]
  bondingCurveInsights: string
}

// === Narrative Designer Output ===

export interface NarrativePackage {
  lore: string
  taglines: string[]
  tweets: string[]
  communityPack: {
    welcome: string
    rules: string
  }
  contentCalendar: string[]
}

// === Visual Director Output ===

export interface VisualAssets {
  imageUrl: string
  imagePrompt: string
  styleDescription: string
  coherenceScore: number
  revisionNotes?: string
  localPath?: string
  allImageUrls?: string[]
  allLocalPaths?: string[]
}

// === Launch Commander Output ===

export interface DeployResult {
  tokenAddress: string
  txHash: string
  name: string
  symbol: string
  fourMemeUrl: string
}

// === Empire (Full Output) ===

export interface Empire {
  token: DeployResult
  narrative: NarrativePackage
  image: VisualAssets
  concept: ConceptBrief
  market: MarketIntel
}

// === Launch Options ===

export interface LaunchOptions {
  onAgentUpdate?: (event: AgentEvent) => void
  preSale?: string
  twitterUrl?: string
  telegramUrl?: string
  webUrl?: string
}

// === Bitquery Types ===

export interface Trade {
  buyer: string
  amount: number
  priceUSD: number
  side: 'buy' | 'sell'
  txHash: string
  timestamp: string
}

export interface PriceUpdate {
  price: number
  marketCap: number
  volume: number
  ohlc: { open: number; high: number; low: number; close: number }
}

export interface Holder {
  address: string
  balance: number
  percentage: number
}
