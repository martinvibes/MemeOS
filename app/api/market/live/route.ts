import { getBondingCurve, getRecentTrades, getTopHolders, type TradeLog } from '@/src/bsc/rpc'
import type { Address } from 'viem'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const POLL_INTERVAL_MS = 5000 // Poll BSC every 5 seconds
const HOLDERS_INTERVAL_MS = 30000 // Holders are more expensive — poll every 30s

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') as Address | null

  if (!token) {
    return new Response('Missing token parameter', { status: 400 })
  }

  const encoder = new TextEncoder()
  const seenTxHashes = new Set<string>()
  let lastBlock: bigint | undefined = undefined

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (data: Record<string, unknown>) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
        }
      }

      // Initial snapshot
      const fetchBondingAndTrades = async () => {
        try {
          const [bonding, tradesResult] = await Promise.all([
            getBondingCurve(token),
            getRecentTrades(token, lastBlock),
          ])

          send({ type: 'bonding', progress: bonding.progressPercent })

          // Estimate price from bonding curve progress
          // Early tokens have very low prices; as curve fills, price rises
          // Simple linear approximation for display purposes
          const estimatedPrice = (bonding.progressPercent / 100) * 0.00005
          const marketCap = estimatedPrice * 1_000_000_000
          send({
            type: 'price',
            price: {
              price: estimatedPrice,
              marketCap,
              volume: 0,
              ohlc: { open: estimatedPrice, high: estimatedPrice, low: estimatedPrice, close: estimatedPrice },
            },
          })

          // Send new trades we haven't seen yet
          const newTrades: TradeLog[] = []
          for (const trade of tradesResult.trades) {
            const key = `${trade.txHash}-${trade.buyer}`
            if (!seenTxHashes.has(key)) {
              seenTxHashes.add(key)
              newTrades.push(trade)
            }
          }

          // Newest first
          for (const trade of newTrades) {
            send({
              type: 'trade',
              trade: {
                buyer: trade.buyer,
                amount: trade.amount,
                priceUSD: estimatedPrice,
                side: trade.side,
                txHash: trade.txHash,
                timestamp: trade.timestamp,
              },
            })
          }

          lastBlock = tradesResult.latestBlock + 1n
        } catch (err) {
          console.error('[live] fetchBondingAndTrades failed:', err)
        }
      }

      const fetchHolders = async () => {
        try {
          const holders = await getTopHolders(token, 10)
          send({ type: 'holders', holders })
        } catch (err) {
          console.error('[live] fetchHolders failed:', err)
        }
      }

      // Fire initial fetches
      await Promise.all([fetchBondingAndTrades(), fetchHolders()])

      // Set up polling intervals
      const bondingInterval = setInterval(fetchBondingAndTrades, POLL_INTERVAL_MS)
      const holdersInterval = setInterval(fetchHolders, HOLDERS_INTERVAL_MS)

      // Clean up on disconnect
      const cleanup = () => {
        closed = true
        clearInterval(bondingInterval)
        clearInterval(holdersInterval)
        try {
          controller.close()
        } catch {}
      }

      request.signal.addEventListener('abort', cleanup)
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
