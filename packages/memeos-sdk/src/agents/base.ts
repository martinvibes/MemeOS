import Anthropic from '@anthropic-ai/sdk'
import type { AgentEvent, AgentName } from '../types'
import { PERSONALITY_MODES, type PersonalityMode } from '../personality/modes'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export abstract class BaseAgent {
  protected client: Anthropic
  protected name: AgentName
  protected personality: PersonalityMode
  private onUpdate?: (event: AgentEvent) => void

  constructor(
    apiKey: string,
    name: AgentName,
    onUpdate?: (event: AgentEvent) => void,
    personality: PersonalityMode = 'balanced',
  ) {
    this.client = new Anthropic({
      apiKey,
      timeout: 60_000,
      maxRetries: 2,
    })
    this.name = name
    this.onUpdate = onUpdate
    this.personality = personality
  }

  protected emit(status: AgentEvent['status'], message: string, data?: unknown) {
    this.onUpdate?.({
      agent: this.name,
      status,
      message,
      data,
      timestamp: Date.now(),
    })
  }

  protected async chat(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    this.emit('running', 'Thinking...')

    // Append personality mode suffix to the system prompt if not balanced
    const modeInfo = PERSONALITY_MODES[this.personality]
    const augmentedSystemPrompt = modeInfo.promptSuffix
      ? `${systemPrompt}\n\n${modeInfo.promptSuffix}`
      : systemPrompt

    let lastError: Error | null = null

    // Outer retry loop for connection errors that bypass SDK retries
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        let fullResponse = ''

        const stream = this.client.messages.stream({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4096,
          system: [{ type: 'text', text: augmentedSystemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullResponse += event.delta.text
            if (fullResponse.length % 100 < event.delta.text.length) {
              const lastLine = fullResponse.split('\n').pop() || ''
              this.emit('running', lastLine.slice(0, 120))
            }
          }
        }

        this.emit('completed', 'Done')
        return fullResponse
      } catch (err) {
        lastError = err as Error
        const msg = lastError.message || ''
        const isRetryable =
          msg.includes('Connection error') ||
          msg.includes('ECONNRESET') ||
          msg.includes('ETIMEDOUT') ||
          msg.includes('fetch failed') ||
          msg.includes('socket hang up') ||
          msg.includes('network') ||
          msg.includes('503') ||
          msg.includes('529') || // overloaded
          msg.includes('502')

        if (!isRetryable || attempt === MAX_RETRIES - 1) {
          break
        }

        const waitMs = RETRY_DELAY_MS * Math.pow(2, attempt) // exponential backoff
        this.emit('running', `Retry ${attempt + 1}/${MAX_RETRIES} in ${waitMs / 1000}s...`)
        await sleep(waitMs)
      }
    }

    this.emit('error', `Failed after ${MAX_RETRIES} retries: ${lastError?.message || 'Unknown error'}`)
    throw lastError || new Error('chat() failed')
  }

  abstract run(input: unknown): Promise<unknown>
}
