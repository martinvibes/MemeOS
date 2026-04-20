import { BaseAgent } from './base'
import type { AgentEvent, ConceptBrief, MarketIntel, NarrativePackage } from '../types'
import type { PersonalityMode } from '../personality/modes'

const SYSTEM_PROMPT = `You are the Narrative Designer of MemeOS, an autonomous meme coin operating system.

Your job: take a concept brief and market intelligence and build the complete narrative identity for a meme coin.

Output ONLY valid JSON matching this schema:
{
  "lore": "The origin story / backstory (2-3 paragraphs, vivid and memeable)",
  "taglines": ["tagline1", "tagline2", "tagline3"],
  "tweets": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"],
  "communityPack": {
    "welcome": "Welcome message for TG/Discord",
    "rules": "Community rules in the token's voice"
  },
  "contentCalendar": ["day1_idea", "day2_idea", "day3_idea", "day4_idea", "day5_idea"]
}

Rules:
- lore: tell a compelling origin story. Make it feel like this character has always existed and is just now being discovered. Weave in the personality traits.
- taglines: 3 punchy lines. Billboard-worthy. Each under 10 words.
- tweets: 5 ready-to-post tweets. Include relevant hashtags. Mix: 1 announcement, 1 meme, 1 community call, 1 hype, 1 philosophical degen wisdom. Each under 280 chars.
- communityPack.welcome: warm, on-brand, makes people feel like they joined something special
- communityPack.rules: 3-5 rules written in the token's personality
- contentCalendar: 5 content ideas for the first week
- Everything must be consistent with the concept brief's personality and humor style.
- Degen-friendly but not cringe. Confident, not desperate.`

interface NarrativeInput {
  concept: ConceptBrief
  marketIntel: MarketIntel
  revisionNotes?: string
}

export class NarrativeDesigner extends BaseAgent {
  constructor(apiKey: string, onUpdate?: (event: AgentEvent) => void, personality: PersonalityMode = 'balanced') {
    super(apiKey, 'narrative-designer', onUpdate, personality)
  }

  async run(input: NarrativeInput): Promise<NarrativePackage> {
    this.emit('running', input.revisionNotes ? 'Revising narrative...' : 'Crafting narrative...')

    let userPrompt = `CONCEPT BRIEF:
Name: ${input.concept.names[0]?.name} ($${input.concept.names[0]?.ticker})
Personality: ${input.concept.personality.join(', ')}
Visual Direction: ${input.concept.visualDirection}
Audience: ${input.concept.audienceProfile}
Narrative Hooks: ${input.concept.narrativeHooks.join(', ')}
Humor Style: ${input.concept.humorStyle}

MARKET CONTEXT:
Current trends: ${input.marketIntel.trendSignals.join(', ')}
What's working in naming: ${input.marketIntel.namingPatterns.join(', ')}`

    if (input.revisionNotes) {
      userPrompt += `\n\nREVISION REQUESTED BY VISUAL DIRECTOR:
${input.revisionNotes}

Please revise the narrative to address these visual coherence concerns while maintaining the core identity.`
    }

    const response = await this.chat(SYSTEM_PROMPT, userPrompt)

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      const narrative = JSON.parse(jsonMatch[0]) as NarrativePackage
      this.emit('completed', `Narrative: "${narrative.taglines[0] || 'Ready'}"`, narrative)
      return narrative
    } catch (e) {
      this.emit('error', `Failed to parse narrative: ${e}`)
      throw new Error(`Narrative Designer failed: ${e}`)
    }
  }
}
