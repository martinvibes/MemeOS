import { ConceptArchitect } from './agents/concept-architect'
import { MarketAnalyst } from './agents/market-analyst'
import { NarrativeDesigner } from './agents/narrative-designer'
import { VisualDirector } from './agents/visual-director'
import { LaunchCommander } from './agents/launch-commander'
import type {
  LaunchOptions, AgentEvent, ConceptBrief, MarketIntel,
  NarrativePackage, VisualAssets, DeployResult,
} from './types'
import type { PersonalityMode } from './personality/modes'

const MAX_CRITIQUE_ROUNDS = 2
const CRITIQUE_THRESHOLD = 7

export interface GenerateResult {
  concept: ConceptBrief
  narrative: NarrativePackage
  image: VisualAssets
  market: MarketIntel
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

export class MemeOS {
  private anthropicKey: string
  private privateKey: string
  private bscRpcUrl: string
  private bitqueryKey: string

  constructor(config: {
    anthropicKey: string
    privateKey: string
    bscRpcUrl: string
    bitqueryKey: string
  }) {
    this.anthropicKey = config.anthropicKey
    this.privateKey = config.privateKey
    this.bscRpcUrl = config.bscRpcUrl
    this.bitqueryKey = config.bitqueryKey
  }

  async generate(vibePrompt: string, onAgentUpdate?: (event: AgentEvent) => void, personality: PersonalityMode = 'balanced'): Promise<GenerateResult> {
    // === Pre-build image URLs IMMEDIATELY from the vibe prompt ===
    // Pollinations.ai generates on-demand when the browser requests the URL.
    // No server-side download here = no timeout risk on serverless.
    // The browser loads images during the review phase; deploy downloads JIT.
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

    // Fast URL-only "images" — no actual download yet
    const prelimImage = { url: buildUrl(1000), localPath: '', prompt: prelimImagePrompt }
    const secondImage = { url: buildUrl(2000), localPath: '', prompt: prelimImagePrompt }

    // --- Phase 1: Market Analyst ---
    const marketAnalyst = new MarketAnalyst(
      this.anthropicKey,
      this.bitqueryKey,
      onAgentUpdate,
      personality,
    )
    const marketIntel = await marketAnalyst.run()

    // --- Phase 2: Concept Architect ---
    const conceptArchitect = new ConceptArchitect(
      this.anthropicKey,
      onAgentUpdate,
      personality,
    )
    const concept = await conceptArchitect.run({ vibePrompt, marketIntel })

    // --- Phase 3: Visual Director (refine with concept) + Narrative Designer (parallel) ---
    const visualDirector = new VisualDirector(
      this.anthropicKey,
      onAgentUpdate,
      personality,
    )
    const narrativeDesigner = new NarrativeDesigner(
      this.anthropicKey,
      onAgentUpdate,
      personality,
    )

    // Visual Director builds the refined prompt + uses the URL-only preliminary images
    const visualsPromise = visualDirector.generateVisuals(concept, prelimImage, secondImage)
    let narrative = await narrativeDesigner.run({ concept, marketIntel })
    const visuals = await visualsPromise

    // --- Phase 4: Critique loop ---
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

      narrative = await narrativeDesigner.run({
        concept,
        marketIntel,
        revisionNotes: critique.revisionNotes,
      })

      critiqueRound++
    }

    return { concept, narrative, image: visuals, market: marketIntel }
  }

  async deploy(options: DeployOptions): Promise<DeployResult> {
    const launchCommander = new LaunchCommander(
      this.anthropicKey,
      options.onAgentUpdate,
    )

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
}
