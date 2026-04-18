# MemeOS — The Autonomous Meme Coin Operating System

> One prompt. Full empire. Real on-chain deployment.

MemeOS is an AI-powered operating system that takes a single vibe prompt and orchestrates a 5-agent swarm to build and deploy a complete meme coin empire on BSC via [four.meme](https://four.meme) — in under 3 minutes.

## What It Does

1. **You type a vibe:** `"aggressive cyber-duck with glitch energy, chaotic internet humor"`
2. **5 AI agents collaborate in real-time:**
   - **Market Analyst** — queries Bitquery for live four.meme market intelligence
   - **Concept Architect** — extracts personality, naming, audience from your vibe
   - **Visual Director** — generates character art + reviews narrative for visual coherence
   - **Narrative Designer** — builds lore, taglines, tweets, community starter pack
   - **Launch Commander** — deploys a real token on BSC via four.meme
3. **Watch it happen live** on a terminal-OS dashboard
4. **Empire Mode activates** — real-time trades, bonding curve, holders, market cap via Bitquery
5. **Download your Meme Passport** — shareable PNG card with your token's identity

Everything is real. Real AI reasoning. Real on-chain transactions. Real market data.

## Architecture

```
User Vibe Prompt
       |
       v
+--- MemeOS Engine --------------------------+
|  Market Analyst --+                         |
|  Concept Architect+                         |
|  Visual Director -+-- Critique Loop --+     |
|  Narrative Designer<------------------+     |
|  Launch Commander -> four.meme deploy       |
+---------+------------------+----------------+
          |                  |
          v                  v
    BSC (four.meme)    Bitquery (live data)
```

### Agent Critique Loop

The Visual Director reviews the Narrative Designer's output for visual coherence (can the narrative be turned into consistent imagery?). If the score is below 7/10, the Narrative Designer revises. Up to 2 revision rounds. This debate is visible on the dashboard in real-time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| AI | Claude Sonnet (Anthropic SDK) with prompt caching |
| Image Gen | Pollinations.ai (Flux model) |
| On-chain | four-meme-ai (BSC token deployment) |
| Market Data | Bitquery GraphQL + WebSocket subscriptions |
| Passport | satori + resvg (server-rendered PNG) |

## Setup

```bash
git clone <repo>
cd memeos
cp .env.local.example .env.local
# Fill in your API keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Required Environment Variables

```
ANTHROPIC_API_KEY=     # Claude API key
PRIVATE_KEY=           # BSC wallet private key (needs BNB for gas)
BSC_RPC_URL=           # BSC RPC endpoint
BITQUERY_API_KEY=      # Bitquery GraphQL access token
```

### Getting API Keys

- **Anthropic:** [console.anthropic.com](https://console.anthropic.com)
- **Bitquery:** [ide.bitquery.io](https://ide.bitquery.io) — sign up, generate token
- **BSC Wallet:** Any wallet with BNB for gas (~$0.10 per token creation)

## Features

### Pre-Launch Intelligence
Before any agent runs, the Market Analyst queries Bitquery for:
- Top 20 tokens by 24h volume on four.meme
- Recent token launch patterns (naming, themes)
- Bonding curve completion rates (what succeeds)

This data feeds into every agent's decisions.

### Post-Launch Empire Mode
After deployment, the dashboard transforms into a live monitor:
- Real-time trade feed via Bitquery WebSocket subscriptions
- Bonding curve progress bar (live calculation)
- Top 10 holders table
- Market cap + price + volume stats
- Meme Passport download (shareable PNG card)

### Meme Passport
A server-rendered PNG card containing:
- Token name + ticker
- Character art
- Key lore tagline
- Contract address
- MemeOS branding

One-click download. Optimized for X/Twitter sharing.

## Phase 2 (Future)

- Guardian agents for autonomous post-launch management
- Monte Carlo virality simulator
- Self-improving memory loop (opt-in anonymized performance data)
- Multi-chain support (Solana, Ethereum)
- SDK extraction for third-party integration

## License

MIT

---

Built for the [Four.Meme AI Sprint Hackathon](https://dorahacks.io/hackathon/fourmemeaisprint) — April 2026
