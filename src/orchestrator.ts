import { ConceptArchitect } from './agents/concept-architect'
import { MarketAnalyst } from './agents/market-analyst'
import { NarrativeDesigner } from './agents/narrative-designer'
import { VisualDirector } from './agents/visual-director'
import { LaunchCommander } from './agents/launch-commander'
import { generateImage } from './image/generator'
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
    // === Start BOTH preliminary images IMMEDIATELY from the vibe prompt ===
    // Runs in parallel with ALL agents so both are ready by review time
    onAgentUpdate?.({
      agent: 'visual-director',
      status: 'running',
      message: 'Pre-generating 2 character art variants from vibe...',
      timestamp: Date.now(),
    })

    const prelimImagePrompt = `${vibePrompt}, high quality digital art, token logo style, centered character on dark background, bold vibrant colors, icon style, no text`

    // Both images generate in parallel from the start
    const [prelimImagePromise, secondImagePromise] = [
      generateImage({
        prompt: prelimImagePrompt,
        width: 512,
        height: 512,
        model: 'flux',
        seed: 1000,
      }).catch(() => null),
      generateImage({
        prompt: prelimImagePrompt,
        width: 512,
        height: 512,
        model: 'flux',
        seed: 2000,
      }).catch(() => null),
    ]

    // --- Phase 1: Market Analyst (runs while images are generating) ---
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

    // Wait for both preliminary images to be ready
    const [prelimImage, secondImage] = await Promise.all([prelimImagePromise, secondImagePromise])

    // Visual Director uses the preliminary images (both already generated)
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
