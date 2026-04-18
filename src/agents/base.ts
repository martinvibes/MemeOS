import Anthropic from '@anthropic-ai/sdk'
import type { AgentEvent, AgentName } from '../types'

export abstract class BaseAgent {
  protected client: Anthropic
  protected name: AgentName
  private onUpdate?: (event: AgentEvent) => void

  constructor(
    apiKey: string,
    name: AgentName,
    onUpdate?: (event: AgentEvent) => void,
  ) {
    this.client = new Anthropic({ apiKey })
    this.name = name
    this.onUpdate = onUpdate
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

    let fullResponse = ''

    const stream = this.client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
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
  }

  abstract run(input: unknown): Promise<unknown>
}
