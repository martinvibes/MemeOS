import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import type { DeployResult } from '../types'

export interface FourMemeConfig {
  privateKey: string
  bscRpcUrl: string
}

export interface CreateTokenParams {
  imagePath: string
  name: string
  shortName: string
  description: string
  label?: string
  preSale?: string
  webUrl?: string
  twitterUrl?: string
  telegramUrl?: string
}

export class FourMemeClient {
  private env: Record<string, string>

  constructor(config: FourMemeConfig) {
    this.env = {
      ...(process.env as unknown as Record<string, string>),
      PRIVATE_KEY: config.privateKey,
      BSC_RPC_URL: config.bscRpcUrl,
    }
  }

  private sanitize(text: string): string {
    return text
      .replace(/[\n\r\t]+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/['"\\`$!{}()]/g, '')
      .trim()
  }

  private runCommand(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(args[0], args.slice(1), {
        env: this.env as NodeJS.ProcessEnv,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data: Buffer) => { stdout += data.toString() })
      proc.stderr.on('data', (data: Buffer) => { stderr += data.toString() })

      const timer = setTimeout(() => {
        proc.kill('SIGTERM')
        reject(new Error('Command timed out after 120s'))
      }, 120_000)

      proc.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0 || stdout.length > 0) {
          resolve({ stdout, stderr })
        } else {
          reject(new Error(`Command exited with code ${code}: ${stderr || stdout}`))
        }
      })

      proc.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
    })
  }

  async createToken(params: CreateTokenParams): Promise<DeployResult> {
    const cleanDesc = this.sanitize(params.description).slice(0, 280)
    const cleanName = this.sanitize(params.name)
    const cleanShortName = params.shortName.replace(/[^\w]/g, '').trim().toUpperCase()

    // Resolve the fourmeme binary by full path (works on Vercel where npx can't find it).
    // Fallback chain:
    //   1. Direct bin symlink: node_modules/.bin/fourmeme
    //   2. Package bin file: node_modules/@four-meme/four-meme-ai/bin/fourmeme.cjs
    const { existsSync } = await import('fs')
    const projectRoot = process.cwd()
    const binSymlink = join(projectRoot, 'node_modules', '.bin', 'fourmeme')
    const binDirect = join(projectRoot, 'node_modules', '@four-meme', 'four-meme-ai', 'bin', 'fourmeme.cjs')

    let fourmemeCmd: string
    if (existsSync(binSymlink)) {
      fourmemeCmd = binSymlink
    } else if (existsSync(binDirect)) {
      fourmemeCmd = `node ${binDirect}`
    } else {
      // Last resort — shouldn't happen if outputFileTracingIncludes is correct
      fourmemeCmd = `npx --yes @four-meme/four-meme-ai`
    }

    // Write a shell script to avoid argument escaping issues entirely
    const scriptPath = join(tmpdir(), `memeos-deploy-${randomUUID()}.sh`)
    const scriptContent = [
      '#!/bin/bash',
      `export PRIVATE_KEY="${this.env.PRIVATE_KEY}"`,
      `export BSC_RPC_URL="${this.env.BSC_RPC_URL}"`,
      `${fourmemeCmd} create-instant \\`,
      `  --image="${params.imagePath}" \\`,
      `  --name="${cleanName}" \\`,
      `  --short-name="${cleanShortName}" \\`,
      `  --desc="${cleanDesc}" \\`,
      `  --label="${params.label || 'Meme'}"`,
    ].join('\n')

    await writeFile(scriptPath, scriptContent, { mode: 0o755 })
    console.log('[four.meme] Using binary:', fourmemeCmd)

    try {
      const { stdout, stderr } = await this.runCommand(['bash', scriptPath])

      if (stderr && !stdout) {
        throw new Error(`four.meme create failed: ${stderr}`)
      }

      const output = stdout.trim()
      const allOutput = `${stdout}\n${stderr}`.trim()

      // Log raw output for debugging
      console.log('[four.meme] Raw CLI output:', output.slice(0, 500))

      // Try to find JSON in output
      let parsed: Record<string, unknown> = {}
      try {
        const jsonMatch = output.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        }
      } catch {
        // Continue to fallback parsing
      }

      // Extract token address and tx hash from parsed output
      let tokenAddress = (parsed.tokenAddress || parsed.token || parsed.address || '') as string
      let txHash = (parsed.txHash || parsed.transactionHash || parsed.hash || '') as string

      // If no txHash in parsed, try to find it in raw output
      if (!txHash) {
        const allHex = [...allOutput.matchAll(/0x[a-fA-F0-9]{64}/g)].map(m => m[0])
        if (allHex.length > 0) txHash = allHex[0]
      }

      // If no token address but we have a txHash, look it up on BSC
      if (!tokenAddress && txHash) {
        console.log('[four.meme] No token address in output, looking up tx receipt:', txHash)
        tokenAddress = await this.getTokenAddressFromTx(txHash)
      }

      // Fallback: try to find address pattern in output (ends in 4444)
      if (!tokenAddress) {
        const fourMemeMatch = allOutput.match(/0x[a-fA-F0-9]{36}4444\b/)
        if (fourMemeMatch) {
          tokenAddress = fourMemeMatch[0]
        }
      }

      if (!tokenAddress) {
        throw new Error(`Could not find token address in output: ${output.slice(0, 300)}`)
      }

      console.log('[four.meme] Parsed — token:', tokenAddress, 'tx:', txHash)

      return {
        tokenAddress,
        txHash: txHash || 'unknown',
        name: params.name,
        symbol: params.shortName,
        fourMemeUrl: `https://four.meme/en/token/${tokenAddress}`,
      }
    } finally {
      await unlink(scriptPath).catch(() => {})
    }
  }

  private async getTokenAddressFromTx(txHash: string): Promise<string> {
    const rpcUrl = this.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org'

    // Wait a few seconds for the tx to be mined
    await new Promise(r => setTimeout(r, 3000))

    // Fetch transaction receipt from BSC RPC
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [txHash],
            id: 1,
          }),
        })

        const json = await response.json()
        const receipt = json.result

        if (!receipt) {
          // TX not mined yet, wait and retry
          console.log(`[four.meme] TX not mined yet, attempt ${attempt + 1}/5...`)
          await new Promise(r => setTimeout(r, 3000))
          continue
        }

        // Look through logs for token address
        // TokenCreate event on four.meme contract emits the token address
        // Also look for Transfer from 0x0 (token minting) — the token contract is the log emitter
        const logs = receipt.logs || []

        // Strategy 1: Find addresses ending in 4444 in log topics/data
        for (const log of logs) {
          const addr = log.address?.toLowerCase()
          if (addr && addr.endsWith('4444')) {
            console.log('[four.meme] Found token address from logs (4444 pattern):', addr)
            return addr
          }
        }

        // Strategy 2: Find Transfer event from 0x0 address (mint)
        // Transfer topic: 0xddf252ad...
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        const zeroAddr = '0x0000000000000000000000000000000000000000000000000000000000000000'
        for (const log of logs) {
          if (log.topics?.[0] === transferTopic && log.topics?.[1] === zeroAddr) {
            const tokenAddr = log.address
            if (tokenAddr) {
              console.log('[four.meme] Found token address from mint Transfer event:', tokenAddr)
              return tokenAddr
            }
          }
        }

        // Strategy 3: Look for any new contract addresses in logs that aren't the four.meme proxy
        const fourMemeProxy = '0x5c952063c7fc8610ffdb798152d69f0b9550762b'
        const uniqueAddrs = [...new Set(logs.map((l: any) => l.address?.toLowerCase()))]
          .filter((a): a is string => !!a && a !== fourMemeProxy)

        if (uniqueAddrs.length > 0) {
          // Prefer addresses ending in 4444
          const fourMemeAddr = uniqueAddrs.find(a => a.endsWith('4444'))
          if (fourMemeAddr) {
            console.log('[four.meme] Found token address from unique log addresses:', fourMemeAddr)
            return fourMemeAddr
          }
          // Otherwise take the first non-proxy address
          console.log('[four.meme] Using first non-proxy log address:', uniqueAddrs[0])
          return uniqueAddrs[0]
        }

        console.log('[four.meme] Could not find token in receipt logs, all addresses:', uniqueAddrs)
        break
      } catch (err) {
        console.error('[four.meme] RPC error:', err)
        if (attempt < 4) await new Promise(r => setTimeout(r, 2000))
      }
    }

    return ''
  }

  async verify(): Promise<string> {
    const { stdout } = await this.runCommand(['npx', 'fourmeme', 'verify'])
    return stdout.trim()
  }
}
