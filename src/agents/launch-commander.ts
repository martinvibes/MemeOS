import { BaseAgent } from './base'
import { FourMemeClient } from '../fourmeme/client'
import type {
  AgentEvent, ConceptBrief, NarrativePackage, VisualAssets,
  DeployResult, LaunchOptions,
} from '../types'

interface LaunchInput {
  concept: ConceptBrief
  narrative: NarrativePackage
  visuals: VisualAssets
  config: { privateKey: string; bscRpcUrl: string }
  options?: LaunchOptions
}

export class LaunchCommander extends BaseAgent {
  constructor(apiKey: string, onUpdate?: (event: AgentEvent) => void) {
    super(apiKey, 'launch-commander', onUpdate)
  }

  async run(input: LaunchInput): Promise<DeployResult> {
    const { concept, narrative, visuals, config, options } = input
    const chosen = concept.names[0]

    if (!chosen) {
      throw new Error('No token name available from Concept Architect')
    }

    this.emit('running', `Preparing ${chosen.name} ($${chosen.ticker}) for deployment...`)

    const fourMeme = new FourMemeClient({
      privateKey: config.privateKey,
      bscRpcUrl: config.bscRpcUrl,
    })

    const description = `${narrative.lore.slice(0, 250)} — ${narrative.taglines[0] || ''}`

    this.emit('running', 'Deploying to BSC via four.meme...')

    if (!visuals.localPath) {
      throw new Error('No local image path available for token creation')
    }

    const result = await fourMeme.createToken({
      imagePath: visuals.localPath,
      name: chosen.name,
      shortName: chosen.ticker,
      description,
      label: 'Meme',
      preSale: options?.preSale,
      webUrl: options?.webUrl,
      twitterUrl: options?.twitterUrl,
      telegramUrl: options?.telegramUrl,
    })

    this.emit('completed', `DEPLOYED: ${result.tokenAddress}`, result)
    return result
  }
}
