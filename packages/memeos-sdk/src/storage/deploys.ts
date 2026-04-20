import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { Redis } from '@upstash/redis'

export interface StoredDeploy {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  lore?: string
  vibePrompt?: string
  tweets?: string[]
  personality?: string[]
  viralityScore?: number
  viralityBreakdown?: {
    naming: number
    visual: number
    narrative: number
    timing: number
  }
  deployedAt: string
}

// ── Storage backends ──────────────────────────────────────────────────────
// Priority: Upstash Redis (if env vars present) → file-based (local dev)

const REDIS_KEY = 'memeos:deploys'
const MAX_DEPLOYS = 100

const DATA_DIR = join(process.cwd(), '.data')
const DEPLOYS_FILE = join(DATA_DIR, 'deploys.json')

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  if (redisClient) return redisClient

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

  if (!url || !token) return null

  redisClient = new Redis({ url, token })
  return redisClient
}

// ── File-based fallback (local dev) ────────────────────────────────────────

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true })
  } catch {
    // ignore
  }
}

async function readFromFile(): Promise<StoredDeploy[]> {
  try {
    const content = await readFile(DEPLOYS_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeToFile(deploys: StoredDeploy[]): Promise<void> {
  try {
    await ensureDataDir()
    await writeFile(DEPLOYS_FILE, JSON.stringify(deploys, null, 2), 'utf-8')
  } catch (err) {
    console.error('[Deploys] Failed to write to file:', err)
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function readDeploys(): Promise<StoredDeploy[]> {
  const redis = getRedis()

  if (redis) {
    try {
      const data = await redis.get<StoredDeploy[]>(REDIS_KEY)
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.error('[Deploys] Redis read failed, falling back to file:', err)
      return readFromFile()
    }
  }

  return readFromFile()
}

export async function writeDeploy(deploy: StoredDeploy): Promise<void> {
  const redis = getRedis()
  const existing = await readDeploys()

  // Skip if this token address is already recorded
  const alreadyExists = existing.some(
    (d) => d.tokenAddress.toLowerCase() === deploy.tokenAddress.toLowerCase()
  )
  if (alreadyExists) return

  const updated = [deploy, ...existing].slice(0, MAX_DEPLOYS)

  if (redis) {
    try {
      await redis.set(REDIS_KEY, updated)
      return
    } catch (err) {
      console.error('[Deploys] Redis write failed, falling back to file:', err)
    }
  }

  await writeToFile(updated)
}

export async function findDeploy(tokenAddress: string): Promise<StoredDeploy | null> {
  const all = await readDeploys()
  return all.find(
    (d) => d.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  ) || null
}

export function getStorageBackend(): 'redis' | 'file' {
  return getRedis() ? 'redis' : 'file'
}

// ── Migration helper ───────────────────────────────────────────────────────
// Useful for seeding Redis from your local file on first Vercel deploy

export async function migrateFileToRedis(): Promise<{ migrated: number; skipped: number }> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')

  const fileDeploys = await readFromFile()
  if (fileDeploys.length === 0) return { migrated: 0, skipped: 0 }

  const existing = await redis.get<StoredDeploy[]>(REDIS_KEY) || []
  const existingAddrs = new Set(existing.map((d) => d.tokenAddress.toLowerCase()))

  let migrated = 0
  let skipped = 0
  const merged = [...existing]

  for (const deploy of fileDeploys) {
    if (existingAddrs.has(deploy.tokenAddress.toLowerCase())) {
      skipped++
    } else {
      merged.push(deploy)
      migrated++
    }
  }

  // Sort newest first
  merged.sort(
    (a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
  )

  await redis.set(REDIS_KEY, merged.slice(0, MAX_DEPLOYS))
  return { migrated, skipped }
}
