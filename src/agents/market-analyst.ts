import { BaseAgent } from './base'
import { BitqueryClient } from '../bitquery/client'
import { TOP_TOKENS_BY_VOLUME, RECENT_TOKEN_LAUNCHES, BONDING_CURVE_LEADERS } from '../bitquery/queries'
import type { AgentEvent, MarketIntel } from '../types'

const SYSTEM_PROMPT = `You are the Market Analyst of MemeOS, an autonomous meme coin operating system.

You receive raw on-chain data from four.meme (BSC) via Bitquery. Your job is to analyze this data and produce actionable market intelligence.

Output ONLY valid JSON matching this schema:
{
  "topTokens": [{ "name": "", "symbol": "", "address": "", "volume24h": 0, "buyers24h": 0, "priceUSD": 0 }],
  "trendSignals": ["signal1", "signal2"],
  "namingPatterns": ["pattern1", "pattern2"],
  "bondingCurveInsights": "Analysis of what types of tokens reach bonding curve graduation"
}

Rules:
- trendSignals: identify 3-5 current trends (themes, styles, narratives) that are working
- namingPatterns: what naming conventions are the top performers using
- bondingCurveInsights: which characteristics correlate with bonding curve completion
- Be specific and data-driven. Reference actual numbers from the data.`

export class MarketAnalyst extends BaseAgent {
  private bitquery: BitqueryClient

  constructor(
    apiKey: string,
    bitqueryKey: string,
    onUpdate?: (event: AgentEvent) => void,
  ) {
    super(apiKey, 'market-analyst', onUpdate)
    this.bitquery = new BitqueryClient(bitqueryKey)
  }

  async run(): Promise<MarketIntel> {
    this.emit('running', 'Querying four.meme on-chain data...')

    const [topTokensData, recentLaunchesData, bondingData] = await Promise.allSettled([
      this.bitquery.query(TOP_TOKENS_BY_VOLUME),
      this.bitquery.query(RECENT_TOKEN_LAUNCHES),
      this.bitquery.query(BONDING_CURVE_LEADERS),
    ])

    this.emit('running', 'Analyzing market patterns...')

    const dataContext = `
TOP TOKENS BY VOLUME (24H):
${JSON.stringify(topTokensData.status === 'fulfilled' ? topTokensData.value : 'Query failed', null, 2)}

RECENT TOKEN LAUNCHES:
${JSON.stringify(recentLaunchesData.status === 'fulfilled' ? recentLaunchesData.value : 'Query failed', null, 2)}

BONDING CURVE LEADERS:
${JSON.stringify(bondingData.status === 'fulfilled' ? bondingData.value : 'Query failed', null, 2)}
`

    const response = await this.chat(SYSTEM_PROMPT, dataContext)

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const intel = JSON.parse(jsonMatch[0]) as MarketIntel
      this.emit('completed', `Analyzed ${intel.topTokens.length} tokens, ${intel.trendSignals.length} trends`, intel)
      return intel
    } catch {
      this.emit('completed', 'Market analysis complete (fallback mode)')
      return {
        topTokens: [],
        trendSignals: ['meme culture', 'animal tokens', 'chaos energy'],
        namingPatterns: ['animal + adjective', 'internet slang', 'pop culture mashup'],
        bondingCurveInsights: 'Tokens with strong community narratives and consistent branding tend to complete bonding curves faster.',
      }
    }
  }
}
