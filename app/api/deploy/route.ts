import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { MemeOS, writeDeploy, type AgentEvent } from 'memeos-sdk'

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
  const {
    concept, narrative, visuals, preSale, twitterUrl, telegramUrl, webUrl,
    vibePrompt, virality,
  } = await request.json()

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

        // Persist deploy to global store BEFORE sending the success event.
        // On Vercel serverless the function terminates as soon as the stream closes,
        // so fire-and-forget writes get cancelled. Await to guarantee the write lands.
        try {
          await writeDeploy({
            name: deployResult.name,
            symbol: deployResult.symbol,
            tokenAddress: deployResult.tokenAddress,
            txHash: deployResult.txHash,
            fourMemeUrl: deployResult.fourMemeUrl,
            imageUrl: (resolvedVisuals as any)?.imageUrl,
            tagline: (narrative as any)?.taglines?.[0],
            lore: (narrative as any)?.lore,
            tweets: (narrative as any)?.tweets,
            personality: (concept as any)?.personality,
            vibePrompt,
            viralityScore: virality?.score,
            viralityBreakdown: virality?.breakdown,
            deployedAt: new Date().toISOString(),
          })
          console.log('[Deploy] Persisted to global store:', deployResult.tokenAddress)
        } catch (e) {
          console.error('[Deploy] Failed to persist:', e)
          // Don't fail the deploy — the token IS on-chain, the feed is just a nice-to-have
        }

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
