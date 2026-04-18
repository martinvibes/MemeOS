import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export interface StoredDeploy {
  name: string
  symbol: string
  tokenAddress: string
  txHash: string
  fourMemeUrl: string
  imageUrl?: string
  tagline?: string
  deployedAt: string
}

const DATA_DIR = join(process.cwd(), '.data')
const DEPLOYS_FILE = join(DATA_DIR, 'deploys.json')

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true })
  } catch {
    // ignore
  }
}

export async function readDeploys(): Promise<StoredDeploy[]> {
  try {
    const content = await readFile(DEPLOYS_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeDeploy(deploy: StoredDeploy): Promise<void> {
  await ensureDataDir()
  const existing = await readDeploys()

  // Skip if this token address is already recorded
  const alreadyExists = existing.some(
    (d) => d.tokenAddress.toLowerCase() === deploy.tokenAddress.toLowerCase()
  )
  if (alreadyExists) return

  // Prepend newest, cap at 100
  const updated = [deploy, ...existing].slice(0, 100)

  try {
    await writeFile(DEPLOYS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.error('[Deploys] Failed to write:', err)
  }
}
