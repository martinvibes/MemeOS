import { BaseAgent } from './base'
import { generateImage, type GeneratedImage } from '../image/generator'
import type { AgentEvent, ConceptBrief, NarrativePackage, VisualAssets } from '../types'
import type { PersonalityMode } from '../personality/modes'

const SYSTEM_PROMPT = `You are the Visual Director of MemeOS, an autonomous meme coin operating system.

You have two modes:

MODE 1 — IMAGE GENERATION: Given a concept brief, create a detailed image generation prompt.
Output JSON:
{
  "imagePrompt": "Detailed prompt for image generation (be specific about style, composition, colors, mood)",
  "styleDescription": "Brief style guide description for brand consistency"
}

MODE 2 — NARRATIVE CRITIQUE: Given a narrative package, score it for visual coherence.
Output JSON:
{
  "coherenceScore": 8,
  "revisionNotes": "Specific notes on what to change for better visual alignment (or empty string if score >= 7)"
}

Rules for image prompts:
- Style: high quality, bold, icon-style, centered character on simple background
- Include: character pose, expression, color palette, art style (flat illustration, 3D render, pixel art, etc.)
- The image will be used as a token logo on four.meme. It must be clear at small sizes.
- Never include text in the image prompt — logos with text look bad at small sizes.

Rules for critique:
- Score 1-10 on: can this narrative be visually represented consistently?
- If score < 7, provide specific, actionable revision notes
- Focus on: are the personality traits visual? Do the taglines evoke clear imagery? Does the lore paint pictures?`

const CRITIQUE_PROMPT = `You are reviewing a narrative package for visual coherence.

Score this narrative 1-10 on how well it translates to visual content (imagery, memes, social media graphics).

Output ONLY valid JSON:
{
  "coherenceScore": <number 1-10>,
  "revisionNotes": "<specific actionable notes if score < 7, empty string if >= 7>"
}`

export class VisualDirector extends BaseAgent {
  constructor(apiKey: string, onUpdate?: (event: AgentEvent) => void, personality: PersonalityMode = 'balanced') {
    super(apiKey, 'visual-director', onUpdate, personality)
  }

  async generateVisuals(
    concept: ConceptBrief,
    prelimImage?: GeneratedImage | null,
    secondImage?: GeneratedImage | null,
  ): Promise<VisualAssets> {
    this.emit('running', 'Refining visual identity...')

    const userPrompt = `CONCEPT BRIEF:
Name: ${concept.names[0]?.name} ($${concept.names[0]?.ticker})
Personality: ${concept.personality.join(', ')}
Visual Direction: ${concept.visualDirection}
Humor Style: ${concept.humorStyle}

Generate an image prompt and style description for this token's logo/character art.`

    const response = await this.chat(SYSTEM_PROMPT, userPrompt)

    let imagePrompt: string
    let styleDescription: string

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      const parsed = JSON.parse(jsonMatch[0])
      imagePrompt = parsed.imagePrompt
      styleDescription = parsed.styleDescription
    } catch {
      imagePrompt = `${concept.visualDirection}, high quality digital art, token logo style, centered composition, vibrant colors`
      styleDescription = concept.visualDirection
    }

    // Use preliminary images if both are ready (generated in parallel from start)
    if (prelimImage && secondImage) {
      this.emit('completed', 'Visual identity complete (2 variants)', { imageUrl: prelimImage.url })
      return {
        imageUrl: prelimImage.url,
        imagePrompt,
        styleDescription,
        coherenceScore: 0,
        localPath: prelimImage.localPath,
        allImageUrls: [prelimImage.url, secondImage.url],
        allLocalPaths: [prelimImage.localPath, secondImage.localPath],
      }
    }

    // If only one is ready, generate the missing one now
    if (prelimImage && !secondImage) {
      this.emit('running', 'Generating second variant...')
      const second = await generateImage({
        prompt: imagePrompt,
        width: 512,
        height: 512,
        model: 'flux',
        seed: 2000,
      })
      this.emit('completed', 'Visual identity complete (2 variants)', { imageUrl: prelimImage.url })
      return {
        imageUrl: prelimImage.url,
        imagePrompt,
        styleDescription,
        coherenceScore: 0,
        localPath: prelimImage.localPath,
        allImageUrls: [prelimImage.url, second.url],
        allLocalPaths: [prelimImage.localPath, second.localPath],
      }
    }

    // No preliminary images available — generate both now
    this.emit('running', 'Generating character art (2 variants)...')

    const [image1, image2] = await Promise.all([
      generateImage({ prompt: imagePrompt, width: 512, height: 512, model: 'flux', seed: 1000 }),
      generateImage({ prompt: imagePrompt, width: 512, height: 512, model: 'flux', seed: 2000 }),
    ])

    this.emit('completed', 'Visual identity complete (2 variants)', { imageUrl: image1.url })

    return {
      imageUrl: image1.url,
      imagePrompt,
      styleDescription,
      coherenceScore: 0,
      localPath: image1.localPath,
      allImageUrls: [image1.url, image2.url],
      allLocalPaths: [image1.localPath, image2.localPath],
    }
  }

  async critiqueNarrative(narrative: NarrativePackage, concept: ConceptBrief): Promise<{
    coherenceScore: number
    revisionNotes: string
  }> {
    this.emit('running', 'Reviewing narrative for visual coherence...')

    const userPrompt = `CONCEPT: ${concept.names[0]?.name} — ${concept.personality.join(', ')}

NARRATIVE TO REVIEW:
Lore: ${narrative.lore}
Taglines: ${narrative.taglines.join(' | ')}
Tweets: ${narrative.tweets.join('\n')}

Score this for visual coherence.`

    const response = await this.chat(CRITIQUE_PROMPT, userPrompt)

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      const result = JSON.parse(jsonMatch[0])
      const score = Number(result.coherenceScore) || 7
      const notes = String(result.revisionNotes || '')

      this.emit(
        'completed',
        `Visual coherence score: ${score}/10${score < 7 ? ' — revision needed' : ' ✓'}`,
        { coherenceScore: score, revisionNotes: notes },
      )

      return { coherenceScore: score, revisionNotes: notes }
    } catch {
      this.emit('completed', 'Visual coherence: 7/10 (default)')
      return { coherenceScore: 7, revisionNotes: '' }
    }
  }

  async run(input: { concept: ConceptBrief }): Promise<VisualAssets> {
    return this.generateVisuals(input.concept)
  }
}
