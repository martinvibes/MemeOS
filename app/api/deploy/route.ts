import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { MemeOS } from '@/src/orchestrator'
import type { AgentEvent } from '@/src/types'

export const runtime = 'nodejs'
export const maxDuration = 120

async function ensureLocalImage(visuals: any): Promise<any> {
  // If localPath exists and is a valid path, use it
  if (visuals.localPath && visuals.localPath.startsWith('/')) {
    return visuals
  }

  // Otherwise download the image from the URL
  if (visuals.imageUrl) {
    console.log('[Deploy] Downloading image from URL:', visuals.imageUrl.slice(0, 80))
    const response = await fetch(visuals.imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const localPath = join(tmpdir(), `memeos-deploy-${randomUUID()}.png`)
    await writeFile(localPath, buffer)
    return { ...visuals, localPath }
  }

  throw new Error('No image available for deployment')
}

export async function POST(request: Request) {
  const { concept, narrative, visuals, preSale, twitterUrl, telegramUrl, webUrl } = await request.json()

  if (!concept || !narrative || !visuals) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Controller might be closed
        }
      }

      try {
        // Ensure image is downloaded locally
        const resolvedVisuals = await ensureLocalImage(visuals)

        const os = new MemeOS({
          anthropicKey: process.env.ANTHROPIC_API_KEY!,
          privateKey: process.env.PRIVATE_KEY!,
          bscRpcUrl: process.env.BSC_RPC_URL!,
          bitqueryKey: process.env.BITQUERY_API_KEY!,
        })

        send({ type: 'agent-event', event: {
          agent: 'launch-commander',
          status: 'running',
          message: 'Preparing deployment...',
          timestamp: Date.now(),
        }})

        const deployResult = await os.deploy({
          concept,
          narrative,
          visuals: resolvedVisuals,
          preSale,
          twitterUrl,
          telegramUrl,
          webUrl,
          onAgentUpdate: (event: AgentEvent) => {
            send({ type: 'agent-event', event })
          },
        })

        send({ type: 'deployed', token: deployResult })
      } catch (error) {
        console.error('[Deploy] Error:', error)
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Deploy failed',
        })
      } finally {
        try {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch {
          // Already closed
        }
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
