import { privateKeyToAccount } from 'viem/accounts'
import {
  BitqueryClient,
  TOKENS_CREATED_BY_DEV,
  readDeploys,
  type StoredDeploy,
} from 'memeos-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface GlobalToken {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  deployedAt: string
}

async function fetchFromBitquery(): Promise<GlobalToken[]> {
  try {
    const privateKey = process.env.PRIVATE_KEY
    const bitqueryKey = process.env.BITQUERY_API_KEY
    if (!privateKey || !bitqueryKey) return []

    const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
    const account = privateKeyToAccount(pk as `0x${string}`)
    const devAddress = account.address.toLowerCase()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const since = thirtyDaysAgo.toISOString().split('T')[0]

    const client = new BitqueryClient(bitqueryKey)
    const data = await client.query<{
      EVM: {
        Transfers: Array<{
          Block: { Time: string }
          Transaction: { Hash: string; From: string }
          Transfer: {
            Amount: string
            Currency: { Name: string; Symbol: string; SmartContract: string }
          }
        }>
      }
    }>(TOKENS_CREATED_BY_DEV, { dev: devAddress, since })

    const transfers = data?.EVM?.Transfers || []
    const seen = new Set<string>()

    return transfers
      .filter((t) => {
        const addr = t.Transfer?.Currency?.SmartContract?.toLowerCase()
        if (!addr || seen.has(addr)) return false
        seen.add(addr)
        return true
      })
      .map((t) => ({
        name: t.Transfer.Currency.Name,
        symbol: t.Transfer.Currency.Symbol,
        tokenAddress: t.Transfer.Currency.SmartContract,
        txHash: t.Transaction.Hash,
        fourMemeUrl: `https://four.meme/en/token/${t.Transfer.Currency.SmartContract}`,
        deployedAt: t.Block.Time,
      }))
  } catch (err) {
    console.error('[Global History] Bitquery failed:', err)
    return []
  }
}

function getDevAddress(): string {
  try {
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) return ''
    const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
    const account = privateKeyToAccount(pk as `0x${string}`)
    return account.address
  } catch {
    return ''
  }
}

export async function GET() {
  // 1. Read from persistent local store (instant, reliable)
  const stored: StoredDeploy[] = await readDeploys()

  // 2. Try to enhance with Bitquery data (may have tokens not in our store yet)
  const bitqueryTokens = await fetchFromBitquery()

  // 3. Merge — stored takes precedence (has image + tagline), add Bitquery entries we don't have
  const seen = new Set<string>()
  const merged: GlobalToken[] = []

  for (const d of stored) {
    const key = d.tokenAddress.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(d)
  }

  for (const t of bitqueryTokens) {
    const key = t.tokenAddress.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(t)
  }

  // Sort by deployedAt descending
  merged.sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime())

  return Response.json({
    tokens: merged.slice(0, 20),
    devAddress: getDevAddress(),
    source: stored.length > 0 ? 'local+bitquery' : 'bitquery',
  })
}
