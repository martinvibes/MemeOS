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

async function fetchWithRetry(url: string, retries = 3, delayMs = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url)
    if (response.ok) return response
    if (response.status === 429 && i < retries - 1) {
      console.log(`[Image] Rate limited, waiting ${delayMs / 1000}s before retry ${i + 1}/${retries}...`)
      await sleep(delayMs * (i + 1))
      continue
    }
    if (!response.ok && i === retries - 1) {
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`)
    }
  }
  throw new Error('Image generation failed after retries')
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
