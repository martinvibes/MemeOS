# memeos-sdk

> The autonomous meme coin operating system. Launch real BSC tokens from a single vibe prompt.

`memeos-sdk` is the engine behind [MemeOS](https://meme-oss.vercel.app). Five specialized AI agents collaborate in real time, debate each other's output, generate character art, and deploy a real token on-chain via [four.meme](https://four.meme) — all from a single function call.

## Install

```bash
npm install memeos-sdk
```

## Quick start

```typescript
import { MemeOS } from 'memeos-sdk'

const os = new MemeOS({
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  privateKey: process.env.PRIVATE_KEY!,          // BSC wallet with gas
  bscRpcUrl: 'https://bsc-dataseed.binance.org', // optional
  bitqueryKey: process.env.BITQUERY_API_KEY,     // optional — enables market intel
})

const empire = await os.launch('aggressive cyber-duck with glitch energy', {
  onAgentUpdate: (event) => console.log(`[${event.agent}]`, event.message),
  personality: 'chaotic',
  computeVirality: true,
})

console.log(empire.token.tokenAddress)   // 0x...4444  — real BSC contract
console.log(empire.token.fourMemeUrl)    // https://four.meme/en/token/0x...
console.log(empire.virality?.score)      // 0-100 viral potential score
console.log(empire.narrative.tweets)     // 5 ready-to-post tweets
console.log(empire.image.imageUrl)       // generated character art URL
```

## API

### `new MemeOS(config)`

```typescript
interface MemeOSConfig {
  anthropicKey: string           // required
  privateKey: string             // required — BSC wallet private key
  bscRpcUrl?: string             // default: bsc-dataseed.binance.org
  bitqueryKey?: string           // optional — enables Bitquery market intel
  upstashRedisUrl?: string       // optional — persistent global deploy feed
  upstashRedisToken?: string
}
```

### `os.launch(vibePrompt, config)`

End-to-end: agents → review → on-chain deploy. Returns an `Empire`.

```typescript
const empire = await os.launch('zen samurai frog', {
  onAgentUpdate: (event) => { /* live agent events */ },
  personality: 'zen',            // balanced | aggressive | zen | chaotic | degen | aesthetic
  computeVirality: true,         // default: true
  persist: true,                 // default: true — writes to global store
  preSale: '0.001',              // optional BNB pre-sale amount
  twitterUrl: 'https://x.com/mytoken',
  telegramUrl: 'https://t.me/mytoken',
  webUrl: 'https://mytoken.com',
})

// empire.token.tokenAddress, empire.token.txHash
// empire.concept — names, personality, audience
// empire.narrative — lore, taglines, tweets, community pack
// empire.image — imageUrl, imagePrompt, coherence score
// empire.market — top performers, trend signals
// empire.virality — overall score + breakdown + verdict
```

### `os.generate(vibePrompt, onAgentUpdate, personality)`

Run the agent swarm WITHOUT deploying. Useful for preview/review flows.

```typescript
const generated = await os.generate('cyberpunk cat', undefined, 'aesthetic')
// generated.concept, generated.narrative, generated.image, generated.market
```

### `os.deploy(options)`

Standalone deploy step. Pass edited concept/narrative/visuals.

```typescript
const result = await os.deploy({
  concept, narrative, visuals,
  onAgentUpdate: (e) => console.log(e),
})
// result.tokenAddress, result.txHash, result.fourMemeUrl
```

### `os.getVirality(generated)`

Score a generated concept 0-100 with a breakdown across naming, visual, narrative, timing. Returns verdict + risk flags.

```typescript
const virality = await os.getVirality(generated)
// { score, breakdown, verdict, riskFlags }
```

### `os.monitor(tokenAddress, options)`

Live on-chain monitoring via BSC RPC. Returns `{ stop() }`.

```typescript
const monitor = os.monitor('0x...', {
  onTrade: (t) => console.log(`${t.side.toUpperCase()} by ${t.buyer}`),
  onBondingUpdate: (b) => console.log(`${b.progressPercent}% to graduation`),
  onHolderChange: (holders) => console.log(`${holders.length} holders`),
  pollIntervalMs: 5000, // default
})

// later
monitor.stop()
```

### `os.getRecentDeploys(limit)` / `os.findDeploy(address)`

Query the global deploy store (Redis if configured, JSON file fallback).

```typescript
const recent = await os.getRecentDeploys(20)
const specific = await os.findDeploy('0x...4444')
```

## Personality modes

Each mode rewrites every agent's system prompt. Same vibe → wildly different outputs.

```typescript
import { PERSONALITY_MODES } from 'memeos-sdk/personality/modes'

PERSONALITY_MODES.balanced   // default swarm voice
PERSONALITY_MODES.aggressive // dominance, alpha, maximum impact
PERSONALITY_MODES.zen        // calm mind, diamond hands
PERSONALITY_MODES.chaotic    // embrace the glitch
PERSONALITY_MODES.degen      // pure on-chain insanity
PERSONALITY_MODES.aesthetic  // Y2K, vaporwave, cyberpunk
```

## Agent anatomy

MemeOS runs five specialized agents. You can instantiate them individually for fine-grained control.

| Agent | Role |
|---|---|
| `MarketAnalyst` | Queries Bitquery for four.meme top performers |
| `ConceptArchitect` | Extracts personality, naming, audience from vibe |
| `VisualDirector` | Generates image prompts + critiques narrative |
| `NarrativeDesigner` | Writes lore, taglines, tweets, community pack |
| `LaunchCommander` | Executes real four.meme deployment |

```typescript
import { ConceptArchitect, MarketAnalyst } from 'memeos-sdk'

const analyst = new MarketAnalyst(anthropicKey, bitqueryKey, undefined, 'aggressive')
const market = await analyst.run()

const architect = new ConceptArchitect(anthropicKey, undefined, 'aggressive')
const concept = await architect.run({ vibePrompt: 'wolf pack', marketIntel: market })
```

## Critique loop

`VisualDirector` scores `NarrativeDesigner`'s output on a 1-10 visual coherence scale. If below 7, it sends specific revision notes and the narrative is regenerated. Up to 2 rounds.

## Storage

Deploys are persisted to either Upstash Redis (production) or a local JSON file (dev). Reads and writes happen automatically. Toggle by providing `upstashRedisUrl` + `upstashRedisToken` in config.

```typescript
import { readDeploys, findDeploy, getStorageBackend } from 'memeos-sdk'

const backend = getStorageBackend()  // 'redis' | 'file'
const all = await readDeploys()
const token = await findDeploy('0x...')
```

## BSC helpers

```typescript
import { bscClient, getBondingCurve, getRecentTrades, getTopHolders } from 'memeos-sdk/bsc/rpc'

const bonding = await getBondingCurve('0x...4444')
// { balance, progressPercent, graduated }

const { trades } = await getRecentTrades('0x...4444')
const holders = await getTopHolders('0x...4444', 10)
```

## Bitquery helpers

```typescript
import {
  BitqueryClient,
  TOP_TOKENS_BY_VOLUME,
  LIVE_TRADES_SUBSCRIPTION,
} from 'memeos-sdk'

const client = new BitqueryClient(process.env.BITQUERY_API_KEY!)
const data = await client.query(TOP_TOKENS_BY_VOLUME)

const sub = client.subscribe(LIVE_TRADES_SUBSCRIPTION, { token: '0x...' }, (event) => {
  console.log(event)
})
```

## Requirements

- Node.js 18+
- An Anthropic API key
- A BSC wallet with a small amount of BNB (~0.001 BNB per token creation)
- Optional: Bitquery access token (free tier) for market intelligence
- Optional: Upstash Redis for persistent storage

## Links

- **Main repo:** [github.com/martinvibes/MemeOS](https://github.com/martinvibes/MemeOS)
- **Live demo:** [meme-oss.vercel.app](https://meme-oss.vercel.app)
- **npm:** [npmjs.com/package/memeos-sdk](https://www.npmjs.com/package/memeos-sdk)
- **Hackathon:** [Four.Meme AI Sprint](https://dorahacks.io/hackathon/fourmemeaisprint)

## License

MIT — Built for the Four.Meme AI Sprint Hackathon, April 2026.
