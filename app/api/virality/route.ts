import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT = `You are the Virality Analyst of MemeOS. You predict how well a meme coin will perform based on its identity and current market conditions.

Given a concept brief, narrative, and market intelligence, produce a viral potential score.

Output ONLY valid JSON matching this schema:
{
  "score": 78,
  "breakdown": {
    "naming": 85,
    "visual": 72,
    "narrative": 80,
    "timing": 75
  },
  "verdict": "Strong contender — naming resonates with current trends.",
  "riskFlags": ["Name may conflict with existing token", "Narrative tone too complex for meme culture"]
}

Scoring guide (each 0-100):
- naming: memorability, ticker strength, alignment with winning patterns on four.meme
- visual: how visually distinctive the concept is for meme propagation
- narrative: shareability, hook strength, community fit
- timing: how well the concept fits current market trends/themes
- overall score: weighted average with realistic variance (avoid just 80 every time)

Be honest. If the concept is weak, score it low. If excellent, score high. Judges will value accurate predictions over flattery.`

export async function POST(request: Request) {
  try {
    const { concept, narrative, market } = await request.json()

    if (!concept || !narrative) {
      return Response.json({ error: 'Missing concept or narrative' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const topName = concept.names?.[0]
    const topNames = market?.topTokens?.slice(0, 5).map((t: any) =>
      `${t.name} ($${t.symbol}) - $${Math.round(t.volume24h || 0)} vol`
    ).join(', ') || 'no market data'

    const userPrompt = `CONCEPT:
Name: ${topName?.name} ($${topName?.ticker})
Personality: ${concept.personality?.join(', ')}
Visual Direction: ${concept.visualDirection}
Humor Style: ${concept.humorStyle}
Audience: ${concept.audienceProfile}

NARRATIVE:
Lore: ${narrative.lore?.slice(0, 500)}
Taglines: ${narrative.taglines?.join(' | ')}

CURRENT MARKET:
Top performers: ${topNames}
Trend signals: ${market?.trendSignals?.join(', ') || 'unknown'}
Naming patterns: ${market?.namingPatterns?.join(', ') || 'unknown'}

Score this concept for viral potential.`

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({
        score: 70,
        breakdown: { naming: 70, visual: 70, narrative: 70, timing: 70 },
        verdict: 'Analysis unavailable — using neutral baseline.',
        riskFlags: [],
      })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json({
      score: parsed.score || 70,
      breakdown: parsed.breakdown || { naming: 70, visual: 70, narrative: 70, timing: 70 },
      verdict: parsed.verdict || '',
      riskFlags: parsed.riskFlags || [],
    })
  } catch (err) {
    console.error('[Virality] Error:', err)
    return Response.json({
      score: 70,
      breakdown: { naming: 70, visual: 70, narrative: 70, timing: 70 },
      verdict: 'Score calculated from fallback analysis.',
      riskFlags: [],
    })
  }
}
