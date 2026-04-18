import { BitqueryClient } from '@/src/bitquery/client'
import { TOP_TOKENS_BY_VOLUME } from '@/src/bitquery/queries'

export const runtime = 'nodejs'

export async function GET() {
  const client = new BitqueryClient(process.env.BITQUERY_API_KEY!)

  try {
    const data = await client.query(TOP_TOKENS_BY_VOLUME)
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 },
    )
  }
}
