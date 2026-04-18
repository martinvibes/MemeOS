import { BitqueryClient } from '@/src/bitquery/client'
import { BONDING_CURVE_PROGRESS, TOP_HOLDERS } from '@/src/bitquery/queries'
import { LIVE_TRADES_SUBSCRIPTION } from '@/src/bitquery/subscriptions'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new Response('Missing token parameter', { status: 400 })
  }

  const encoder = new TextEncoder()
  const bitquery = new BitqueryClient(process.env.BITQUERY_API_KEY!)

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Live trades via WebSocket
      const tradeSub = bitquery.subscribe(
        LIVE_TRADES_SUBSCRIPTION,
        { token },
        (data: unknown) => {
          const trades = (data as any)?.EVM?.DEXTrades || []
          for (const t of trades) {
            send({
              type: 'trade',
              trade: {
                buyer: t.Trade?.Buy?.Buyer || '',
                amount: Number(t.Trade?.Buy?.Amount || 0),
                priceUSD: Number(t.Trade?.Buy?.PriceInUSD || 0),
                side: 'buy',
                txHash: t.Transaction?.Hash || '',
                timestamp: t.Block?.Time || new Date().toISOString(),
              },
            })
          }
        },
      )

      // Poll bonding curve + holders every 30s
      const poll = async () => {
        try {
          const [bondingData, holdersData] = await Promise.allSettled([
            bitquery.query(BONDING_CURVE_PROGRESS, { token }),
            bitquery.query(TOP_HOLDERS, { token }),
          ])

          if (bondingData.status === 'fulfilled') {
            const balance = Number(
              (bondingData.value as any)?.EVM?.BalanceUpdates?.[0]?.balance || 0
            )
            const progress = 100 - (((balance - 200000000) * 100) / 800000000)
            send({ type: 'bonding', progress: Math.max(0, Math.min(100, progress)) })
          }

          if (holdersData.status === 'fulfilled') {
            const balances = (holdersData.value as any)?.EVM?.TransactionBalances || []
            send({
              type: 'holders',
              holders: balances.map((b: any) => ({
                address: b.TokenBalance?.Address || '',
                balance: Number(b.TokenBalance?.Balance || 0),
                percentage: Number(b.holding_percentage || 0),
              })),
            })
          }
        } catch {
          // Continue polling
        }
      }

      poll()
      const pollInterval = setInterval(poll, 30_000)

      request.signal.addEventListener('abort', () => {
        tradeSub.stop()
        clearInterval(pollInterval)
        controller.close()
      })
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
