// ── Main SDK class ─────────────────────────────────────────────────────────
export { MemeOS } from './orchestrator'
export type {
  MemeOSConfig,
  Empire,
  GenerateResult,
  DeployOptions,
  LaunchConfig,
  ViralityResult,
  MonitorOptions,
  MonitorHandle,
} from './orchestrator'

// ── Personality modes ──────────────────────────────────────────────────────
export {
  PERSONALITY_MODES,
  type PersonalityMode,
  type PersonalityModeInfo,
} from './personality/modes'

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  AgentEvent,
  AgentName,
  AgentStatus,
  ConceptBrief,
  MarketIntel,
  NarrativePackage,
  VisualAssets,
  DeployResult,
  Trade,
  PriceUpdate,
  Holder,
  TokenSummary,
  LaunchOptions,
} from './types'

// ── Individual agent classes (advanced users) ──────────────────────────────
export { BaseAgent } from './agents/base'
export { ConceptArchitect } from './agents/concept-architect'
export { MarketAnalyst } from './agents/market-analyst'
export { NarrativeDesigner } from './agents/narrative-designer'
export { VisualDirector } from './agents/visual-director'
export { LaunchCommander } from './agents/launch-commander'

// ── Integrations ───────────────────────────────────────────────────────────
export { BitqueryClient } from './bitquery/client'
export {
  TOP_TOKENS_BY_VOLUME,
  RECENT_TOKEN_LAUNCHES,
  BONDING_CURVE_LEADERS,
  TOKEN_OHLCV,
  TOP_HOLDERS,
  BONDING_CURVE_PROGRESS,
  TOKENS_CREATED_BY_DEV,
} from './bitquery/queries'
export {
  LIVE_TRADES_SUBSCRIPTION,
  LIVE_MARKET_CAP_SUBSCRIPTION,
} from './bitquery/subscriptions'
export { FourMemeClient } from './fourmeme/client'
export {
  bscClient,
  getBondingCurve,
  getRecentTrades,
  getTopHolders,
  getTokenInfo,
  FOUR_MEME_PROXY,
  type BondingCurveData,
  type HolderInfo,
  type TradeLog,
} from './bsc/rpc'

// ── Image generation ───────────────────────────────────────────────────────
export {
  generateImage,
  type GenerateImageOptions,
  type GeneratedImage,
} from './image/generator'

// ── Storage (pluggable) ────────────────────────────────────────────────────
export {
  readDeploys,
  writeDeploy,
  findDeploy,
  getStorageBackend,
  migrateFileToRedis,
  type StoredDeploy,
} from './storage/deploys'
