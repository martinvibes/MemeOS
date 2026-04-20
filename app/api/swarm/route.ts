import { MemeOS, type AgentEvent } from 'memeos-sdk'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  const { vibePrompt, personality } = await request.json()

  if (!vibePrompt || typeof vibePrompt !== 'string') {
    return new Response(JSON.stringify({ error: 'vibePrompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const os = new MemeOS({
          anthropicKey: process.env.ANTHROPIC_API_KEY!,
          privateKey: process.env.PRIVATE_KEY!,
          bscRpcUrl: process.env.BSC_RPC_URL!,
          bitqueryKey: process.env.BITQUERY_API_KEY!,
        })

        // Only generate — don't deploy. User reviews first.
        const result = await os.generate(
          vibePrompt,
          (event: AgentEvent) => {
            send({ type: 'agent-event', event })
          },
          personality,
        )

        send({ type: 'generated', result })
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
