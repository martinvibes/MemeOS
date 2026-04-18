import { BaseAgent } from './base'
import type { AgentEvent, ConceptBrief, MarketIntel } from '../types'

const SYSTEM_PROMPT = `You are the Concept Architect of MemeOS, an autonomous meme coin operating system.

Your job: take a raw "vibe prompt" from a user and extract a structured concept brief for a meme coin.

You will also receive market intelligence about what's currently performing well on four.meme (BSC). Use this data to calibrate your recommendations — lean into trends that are working, but keep the concept unique.

Output ONLY valid JSON matching this schema:
{
  "names": [
    { "name": "Full Token Name", "ticker": "TICKER", "reasoning": "Why this works" }
  ],
  "personality": ["trait1", "trait2", "trait3"],
  "visualDirection": "Detailed visual style description for image generation",
  "audienceProfile": "Who this token targets and why they'd buy",
  "narrativeHooks": ["hook1", "hook2", "hook3"],
  "humorStyle": "Description of the humor/tone"
}

Rules:
- Generate exactly 3 name candidates. Tickers must be 3-6 chars, uppercase, memorable.
- personality array: 3-5 distinct personality traits
- visualDirection: be specific enough for an image generation prompt (colors, style, mood, composition)
- narrativeHooks: 3 viral-worthy hooks that make people want to share
- Keep everything edgy but not offensive. Degen-friendly, not toxic.
- Names should be catchy, memeable, and easy to remember. Check they don't conflict with top performers in the market data.`

interface ConceptInput {
  vibePrompt: string
  marketIntel?: MarketIntel
}

export class ConceptArchitect extends BaseAgent {
  constructor(apiKey: string, onUpdate?: (event: AgentEvent) => void) {
    super(apiKey, 'concept-architect', onUpdate)
  }

  async run(input: ConceptInput): Promise<ConceptBrief> {
    this.emit('running', 'Analyzing vibe dimensions...')

    let userPrompt = `VIBE PROMPT: "${input.vibePrompt}"`

    if (input.marketIntel) {
      const topNames = input.marketIntel.topTokens
        .slice(0, 10)
        .map(t => `${t.name} (${t.symbol}) — $${Math.round(t.volume24h)} vol`)
        .join('\n')

      userPrompt += `\n\nCURRENT MARKET INTELLIGENCE:
Top performing tokens (24h):
${topNames}

Trend signals: ${input.marketIntel.trendSignals.join(', ')}
Naming patterns: ${input.marketIntel.namingPatterns.join(', ')}
${input.marketIntel.bondingCurveInsights}`
    }

    const response = await this.chat(SYSTEM_PROMPT, userPrompt)

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const brief = JSON.parse(jsonMatch[0]) as ConceptBrief
      this.emit('completed', `Concept: ${brief.names[0]?.name || 'Generated'}`, brief)
      return brief
    } catch (e) {
      this.emit('error', `Failed to parse concept: ${e}`)
      throw new Error(`Concept Architect failed to produce valid output: ${e}`)
    }
  }
}
