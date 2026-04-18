import { createPublicClient, http, parseAbi, fallback, type Address } from 'viem'
import { bsc } from 'viem/chains'

export const FOUR_MEME_PROXY: Address = '0x5c952063c7fc8610FFDB798152D69F0B9550762b'

const TOTAL_SUPPLY = 1_000_000_000n
const RESERVED = 200_000_000n

// Use multiple RPC endpoints with fallback for better reliability
const RPC_ENDPOINTS = [
  process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc.publicnode.com',
  'https://binance.llamarpc.com',
]

export const bscClient = createPublicClient({
  chain: bsc,
  transport: fallback(RPC_ENDPOINTS.map((url) => http(url, { retryCount: 1, timeout: 8000 }))),
})

const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])

export interface BondingCurveData {
  balance: number
  progressPercent: number
  graduated: boolean
}

export async function getBondingCurve(tokenAddress: Address): Promise<BondingCurveData> {
  const rawBalance = await bscClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [FOUR_MEME_PROXY],
  })

  const balanceInTokens = Number(rawBalance / BigInt(10 ** 18))
  const progress = 100 - (((balanceInTokens - Number(RESERVED)) * 100) / 800_000_000)
  const clamped = Math.max(0, Math.min(100, progress))

  return {
    balance: balanceInTokens,
    progressPercent: clamped,
    graduated: clamped >= 99.9,
  }
}

export interface TradeLog {
  buyer: string
  amount: number
  side: 'buy' | 'sell'
  txHash: string
  blockNumber: number
  timestamp: string
}

/**
 * Get recent trades using a small block window.
 * Public RPCs typically allow ~5000 block range per eth_getLogs call.
 * We use 50 blocks (~2.5 min on BSC) to stay safe.
 */
export async function getRecentTrades(
  tokenAddress: Address,
  fromBlock?: bigint,
): Promise<{ trades: TradeLog[]; latestBlock: bigint }> {
  try {
    const currentBlock = await bscClient.getBlockNumber()
    // Small window: 50 blocks ~ 2.5 min
    const startBlock = fromBlock ?? currentBlock - 50n

    const logs = await bscClient.getLogs({
      address: tokenAddress,
      event: ERC20_ABI[5],
      fromBlock: startBlock,
      toBlock: currentBlock,
    })

    const proxyLower = FOUR_MEME_PROXY.toLowerCase()
    const trades: TradeLog[] = []

    for (const log of logs) {
      const from = (log.args.from || '').toLowerCase()
      const to = (log.args.to || '').toLowerCase()
      const amount = Number(log.args.value || 0n) / 1e18

      let side: 'buy' | 'sell' | null = null
      let participant = ''

      if (from === proxyLower) {
        side = 'buy'
        participant = log.args.to || ''
      } else if (to === proxyLower) {
        side = 'sell'
        participant = log.args.from || ''
      }

      if (!side) continue

      // Skip the 0→dev mint event (initial supply)
      if (log.args.from === '0x0000000000000000000000000000000000000000') continue

      trades.push({
        buyer: participant,
        amount,
        side,
        txHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        timestamp: new Date().toISOString(), // Skip block timestamp to avoid extra RPC call
      })
    }

    trades.sort((a, b) => b.blockNumber - a.blockNumber)

    return { trades, latestBlock: currentBlock }
  } catch (err) {
    console.error('[BSC RPC] getRecentTrades error:', (err as Error).message)
    return { trades: [], latestBlock: 0n }
  }
}

export interface HolderInfo {
  address: string
  balance: number
  percentage: number
}

/**
 * Get top holders by scanning Transfer events in chunks of 5000 blocks.
 * Limits to last ~24 hours (28,800 blocks) to keep query count reasonable.
 */
export async function getTopHolders(tokenAddress: Address, limit = 10): Promise<HolderInfo[]> {
  try {
    const currentBlock = await bscClient.getBlockNumber()
    const lookback = 28_800n // ~24 hours on BSC
    const chunkSize = 5_000n

    const balances = new Map<string, bigint>()
    const startBlock = currentBlock - lookback

    // Chunk the queries to stay within RPC limits
    const chunks: Array<Promise<void>> = []
    for (let from = startBlock; from <= currentBlock; from += chunkSize) {
      const to = from + chunkSize - 1n > currentBlock ? currentBlock : from + chunkSize - 1n
      chunks.push(
        (async () => {
          try {
            const logs = await bscClient.getLogs({
              address: tokenAddress,
              event: ERC20_ABI[5],
              fromBlock: from,
              toBlock: to,
            })
            for (const log of logs) {
              const fromAddr = log.args.from!
              const toAddr = log.args.to!
              const value = log.args.value!

              if (fromAddr !== '0x0000000000000000000000000000000000000000') {
                balances.set(fromAddr, (balances.get(fromAddr) || 0n) - value)
              }
              balances.set(toAddr, (balances.get(toAddr) || 0n) + value)
            }
          } catch {
            // Skip failed chunks
          }
        })(),
      )
      // Only do 3 chunks max to avoid rate limits
      if (chunks.length >= 3) break
    }

    await Promise.all(chunks)

    const proxyLower = FOUR_MEME_PROXY.toLowerCase()
    const zeroAddr = '0x0000000000000000000000000000000000000000'

    const entries = [...balances.entries()]
      .filter(([addr, bal]) => {
        const lower = addr.toLowerCase()
        return bal > 0n && lower !== proxyLower && lower !== zeroAddr
      })
      .sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0))
      .slice(0, limit)

    const totalSupplyRaw = BigInt(10 ** 18) * TOTAL_SUPPLY
    return entries.map(([address, balance]) => ({
      address,
      balance: Number(balance / BigInt(10 ** 18)),
      percentage: Number((balance * 10000n) / totalSupplyRaw) / 100,
    }))
  } catch (err) {
    console.error('[BSC RPC] getTopHolders error:', (err as Error).message)
    return []
  }
}

export async function getTokenInfo(tokenAddress: Address): Promise<{ name: string; symbol: string } | null> {
  try {
    const [name, symbol] = await Promise.all([
      bscClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'name' }),
      bscClient.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: 'symbol' }),
    ])
    return { name, symbol }
  } catch {
    return null
  }
}
