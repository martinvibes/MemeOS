import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

export interface GenerateImageOptions {
  prompt: string
  width?: number
  height?: number
  model?: string
  seed?: number
}

export interface GeneratedImage {
  url: string
  localPath: string
  prompt: string
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, retries = 4, delayMs = 2000): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(45_000), // 45s timeout
      })
      if (response.ok) return response
      if ((response.status === 429 || response.status >= 500) && i < retries - 1) {
        console.log(`[Image] HTTP ${response.status}, retrying in ${delayMs / 1000}s (${i + 1}/${retries})...`)
        await sleep(delayMs * Math.pow(2, i))
        continue
      }
      if (!response.ok && i === retries - 1) {
        throw new Error(`Image generation failed: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      lastError = err as Error
      const msg = lastError.message || ''
      // Retry on network/connection errors
      if (i < retries - 1 && (
        msg.includes('fetch failed') ||
        msg.includes('timeout') ||
        msg.includes('ECONNRESET') ||
        msg.includes('socket hang up') ||
        msg.includes('ETIMEDOUT')
      )) {
        console.log(`[Image] Network error, retrying in ${delayMs / 1000}s (${i + 1}/${retries}):`, msg.slice(0, 80))
        await sleep(delayMs * Math.pow(2, i))
        continue
      }
      throw err
    }
  }
  throw lastError || new Error('Image generation failed after retries')
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const {
    prompt,
    width = 512,
    height = 512,
    model = 'flux',
    seed = Math.floor(Math.random() * 100000),
  } = options

  const encodedPrompt = encodeURIComponent(prompt)
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`

  const response = await fetchWithRetry(url)

  const buffer = Buffer.from(await response.arrayBuffer())
  const localPath = join(tmpdir(), `memeos-${randomUUID()}.png`)
  await writeFile(localPath, buffer)

  return { url, localPath, prompt }
}

export async function generateMultipleImages(
  prompt: string,
  count: number = 3,
  options: Omit<GenerateImageOptions, 'prompt' | 'seed'> = {},
): Promise<GeneratedImage[]> {
  const seeds = [1000, 2000, 3000]
  const results: GeneratedImage[] = []

  // Generate sequentially with delays to avoid rate limits
  for (let i = 0; i < count; i++) {
    if (i > 0) await sleep(1500) // 1.5s between requests
    const img = await generateImage({
      prompt,
      seed: seeds[i] || Math.floor(Math.random() * 100000),
      ...options,
    })
    results.push(img)
  }

  return results
}
