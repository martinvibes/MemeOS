'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Cpu,
  Eye,
  Rocket,
  Crown,
  BarChart3,
  Dna,
  Palette,
  ScrollText,
  Terminal,
  Sparkles,
  Check,
  ChevronRight,
  Package,
} from 'lucide-react'

function Github({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/>
    </svg>
  )
}

// ----- Data -----

const FLOW_STEPS = [
  {
    n: '01',
    icon: Zap,
    title: 'TYPE YOUR VIBE',
    desc: 'Describe the vibe in natural language',
    color: 'amber',
  },
  {
    n: '02',
    icon: Cpu,
    title: 'AGENTS COLLABORATE',
    desc: '5 specialized AI agents generate everything',
    color: 'violet',
  },
  {
    n: '03',
    icon: Eye,
    title: 'REVIEW & EDIT',
    desc: 'Pick your favorite name, edit lore, choose image',
    color: 'cyan',
  },
  {
    n: '04',
    icon: Rocket,
    title: 'DEPLOY TO BSC',
    desc: 'Real token created via four.meme Agent Skill',
    color: 'emerald',
  },
  {
    n: '05',
    icon: Crown,
    title: 'EMPIRE MODE',
    desc: 'Live monitoring via Bitquery + BSC RPC',
    color: 'amber',
  },
] as const

const AGENTS = [
  {
    icon: BarChart3,
    name: 'Market Analyst',
    role: 'INTEL',
    desc: 'Queries live four.meme data from Bitquery for pre-launch intelligence',
    color: 'cyan',
  },
  {
    icon: Dna,
    name: 'Concept Architect',
    role: 'IDENTITY',
    desc: 'Extracts personality, naming, and narrative hooks from your vibe',
    color: 'violet',
  },
  {
    icon: Palette,
    name: 'Visual Director',
    role: 'IMAGERY',
    desc: 'Generates character art and reviews narrative for visual coherence',
    color: 'amber',
  },
  {
    icon: ScrollText,
    name: 'Narrative Designer',
    role: 'STORY',
    desc: 'Crafts lore, taglines, tweets, and a community starter pack',
    color: 'emerald',
  },
  {
    icon: Rocket,
    name: 'Launch Commander',
    role: 'DEPLOY',
    desc: 'Executes real BSC token creation via four.meme Agent Skill',
    color: 'cyan',
  },
] as const

const TECH = [
  { label: 'Claude Sonnet', detail: 'Anthropic SDK with prompt caching' },
  { label: 'four.meme Agent Skill', detail: 'Real BSC token deploys' },
  { label: 'Bitquery GraphQL', detail: 'Market intelligence' },
  { label: 'BSC RPC', detail: 'Live on-chain monitoring' },
  { label: 'Pollinations.ai', detail: 'Image generation' },
  { label: 'Next.js 14', detail: 'Tailwind + Framer Motion' },
  { label: 'satori + resvg', detail: 'Meme Passport PNG' },
]

const COMPARE = [
  {
    label: 'OTHER LAUNCHERS',
    tag: 'BASIC',
    tone: 'muted',
    items: [
      'Deploys a token',
      'Manual naming and branding',
      'Zero follow-through after launch',
      'No intelligence layer',
    ],
  },
  {
    label: 'MEMEOS',
    tag: 'FULL SPECTRUM',
    tone: 'cyan',
    items: [
      'Concept -> deploy -> monitoring',
      'AI swarm writes the entire empire',
      'Shareable Meme Passport artifact',
      'Real-time on-chain pulse',
    ],
  },
  {
    label: 'PHASE 2',
    tag: 'COMING',
    tone: 'violet',
    items: [
      'Guardian agents',
      'Virality simulator',
      'Self-improving memory',
      'Multi-chain expansion',
    ],
  },
] as const

// ----- Helpers -----

const colorClass = (c: string, kind: 'text' | 'border' | 'bg' | 'shadow') => {
  const map: Record<string, Record<string, string>> = {
    cyan: {
      text: 'text-memeos-cyan',
      border: 'border-memeos-cyan/30',
      bg: 'bg-memeos-cyan/10',
      shadow: 'shadow-glow-cyan',
    },
    violet: {
      text: 'text-memeos-violet',
      border: 'border-memeos-violet/30',
      bg: 'bg-memeos-violet/10',
      shadow: 'shadow-glow-violet',
    },
    amber: {
      text: 'text-memeos-amber',
      border: 'border-memeos-amber/30',
      bg: 'bg-memeos-amber/10',
      shadow: 'shadow-glow-amber',
    },
    emerald: {
      text: 'text-memeos-emerald',
      border: 'border-memeos-emerald/30',
      bg: 'bg-memeos-emerald/10',
      shadow: 'shadow-glow-cyan',
    },
  }
  return map[c]?.[kind] ?? ''
}

// ----- Page -----

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-memeos-bg relative overflow-x-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-memeos-cyan/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[500px] rounded-full bg-memeos-violet/5 blur-[120px]" />
      </div>

      {/* === Top Navigation === */}
      <nav className="border-b border-memeos-border bg-memeos-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-mono text-sm text-memeos-text-muted hover:text-memeos-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
            <div className="h-4 w-px bg-memeos-border" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-memeos-cyan" />
              <span className="font-mono text-memeos-cyan text-base font-bold tracking-wider">
                MEMEOS
              </span>
              <span className="font-mono text-[10px] text-memeos-text-muted bg-memeos-surface px-2 py-0.5 rounded border border-memeos-border">
                v1.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="font-mono text-[10px] text-memeos-text-muted tracking-[0.25em] uppercase">
              System Documentation
            </span>
            <ChevronRight className="w-3 h-3 text-memeos-text-muted" />
            <span className="font-mono text-[10px] text-memeos-cyan tracking-[0.25em] uppercase">
              How It Works
            </span>
          </div>
        </div>
      </nav>

      {/* === Hero === */}
      <section className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-memeos-border bg-memeos-surface/60 backdrop-blur-sm mb-6">
            <Sparkles className="w-3 h-3 text-memeos-cyan" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-memeos-text-dim">
              Field Manual / v1.0
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6"
        >
          <span className="bg-gradient-to-r from-memeos-cyan via-memeos-text to-memeos-violet bg-clip-text text-transparent">
            How MemeOS Works
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-memeos-text-dim text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          An autonomous AI swarm that takes your vibe and launches a real meme coin
          on <span className="text-memeos-cyan">BSC</span> in under{' '}
          <span className="text-memeos-amber">3 minutes</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 font-mono text-[10px] tracking-[0.2em] uppercase text-memeos-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-memeos-emerald animate-pulse" />
            Live on BSC Mainnet
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Four.Meme AI Sprint 2026</span>
        </motion.div>
      </section>

      {/* === Section 1: Flow === */}
      <Section
        eyebrow="Section 01"
        title="The Flow"
        subtitle="From vibe to on-chain empire in five deterministic phases."
      >
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
          {FLOW_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative"
              >
                <div
                  className={`glass-panel holo-border p-5 h-full flex flex-col gap-3 relative overflow-hidden group hover:border-memeos-cyan/40 transition-colors`}
                >
                  {/* step number watermark */}
                  <span className="absolute -top-2 -right-1 font-mono text-6xl font-bold text-memeos-text/[0.04] select-none">
                    {step.n}
                  </span>

                  <div
                    className={`w-10 h-10 rounded-md border ${colorClass(
                      step.color,
                      'border'
                    )} ${colorClass(step.color, 'bg')} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colorClass(step.color, 'text')}`} />
                  </div>

                  <div className="space-y-1">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-memeos-text-muted">
                      STEP {step.n}
                    </p>
                    <h3 className="font-mono text-sm font-bold tracking-wider text-memeos-text">
                      {step.title}
                    </h3>
                  </div>

                  <p className="font-sans text-xs text-memeos-text-dim leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connector arrow (desktop only) */}
                {i < FLOW_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-memeos-cyan/60" />
                  </div>
                )}
                {/* Stacked arrow (mobile only) */}
                {i < FLOW_STEPS.length - 1 && (
                  <div className="flex md:hidden justify-center py-2">
                    <ArrowRight className="w-4 h-4 text-memeos-cyan/60 rotate-90" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* === Section 2: Agent Swarm === */}
      <Section
        eyebrow="Section 02"
        title="The Agent Swarm"
        subtitle="Five specialized agents, orchestrated by Claude Sonnet, each owning a vertical slice of the launch."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-panel holo-border p-5 relative group hover:border-memeos-violet/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-md border ${colorClass(
                      agent.color,
                      'border'
                    )} ${colorClass(
                      agent.color,
                      'bg'
                    )} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colorClass(agent.color, 'text')}`} />
                  </div>
                  <span
                    className={`font-mono text-[9px] tracking-[0.25em] px-2 py-1 rounded border ${colorClass(
                      agent.color,
                      'border'
                    )} ${colorClass(agent.color, 'text')} ${colorClass(
                      agent.color,
                      'bg'
                    )}`}
                  >
                    {agent.role}
                  </span>
                </div>

                <h3 className="font-mono text-base font-bold tracking-wide text-memeos-text mb-2">
                  {agent.name}
                </h3>
                <p className="font-sans text-xs text-memeos-text-dim leading-relaxed">
                  {agent.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-memeos-border flex items-center gap-2 font-mono text-[10px] text-memeos-text-muted">
                  <span className="w-1 h-1 rounded-full bg-memeos-emerald animate-pulse" />
                  AGENT.{String(i + 1).padStart(2, '0')} ONLINE
                </div>
              </motion.div>
            )
          })}

          {/* Critique loop callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-panel p-5 relative sm:col-span-2 lg:col-span-1 overflow-hidden border-memeos-amber/30"
            style={{ borderStyle: 'dashed' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-memeos-amber/5 via-transparent to-memeos-violet/5 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-memeos-amber animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.25em] text-memeos-amber">
                  CRITIQUE LOOP
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold tracking-wide text-memeos-text mb-3">
                Self-Correcting Swarm
              </h3>
              <p className="font-sans text-xs text-memeos-text-dim leading-relaxed mb-3">
                Visual Director scores Narrative for visual coherence{' '}
                <span className="font-mono text-memeos-cyan">(1-10)</span>.
              </p>
              <p className="font-sans text-xs text-memeos-text-dim leading-relaxed">
                If{' '}
                <span className="font-mono text-memeos-amber">score &lt; 7</span>,
                Narrative Designer revises. Max{' '}
                <span className="font-mono text-memeos-violet">2 rounds</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* === Section 3: Tech Stack === */}
      <Section
        eyebrow="Section 03"
        title="Tech Stack"
        subtitle="Every integration is real. Every call hits production infrastructure."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECH.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-panel holo-border p-4 flex items-start gap-3 hover:border-memeos-cyan/40 transition-colors"
            >
              <div className="w-8 h-8 rounded border border-memeos-cyan/30 bg-memeos-cyan/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-memeos-cyan" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-memeos-text truncate">
                  {t.label}
                </p>
                <p className="font-sans text-xs text-memeos-text-dim leading-snug mt-0.5">
                  {t.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* === Section 4: What Makes MemeOS Different === */}
      <Section
        eyebrow="Section 04"
        title="What Makes MemeOS Different"
        subtitle="A launcher is the tip of the iceberg. MemeOS ships the whole iceberg."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMPARE.map((col, i) => {
            const isFeatured = col.tone === 'cyan'
            const tone = col.tone as 'muted' | 'cyan' | 'violet'
            const toneText =
              tone === 'cyan'
                ? 'text-memeos-cyan'
                : tone === 'violet'
                ? 'text-memeos-violet'
                : 'text-memeos-text-muted'
            const toneBorder =
              tone === 'cyan'
                ? 'border-memeos-cyan/40'
                : tone === 'violet'
                ? 'border-memeos-violet/30'
                : 'border-memeos-border'
            const toneBg =
              tone === 'cyan'
                ? 'bg-memeos-cyan/5'
                : tone === 'violet'
                ? 'bg-memeos-violet/5'
                : 'bg-memeos-surface/30'
            return (
              <motion.div
                key={col.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-panel p-6 border ${toneBorder} ${toneBg} ${
                  isFeatured ? 'md:-translate-y-4 shadow-glow-cyan' : ''
                } relative`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase px-3 py-1 rounded-full bg-memeos-cyan text-memeos-bg font-bold">
                      You Are Here
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-mono text-sm font-bold tracking-wider ${toneText}`}>
                    {col.label}
                  </h3>
                  <span
                    className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 rounded border ${toneBorder} ${toneText}`}
                  >
                    {col.tag}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-sans text-xs text-memeos-text-dim"
                    >
                      <ChevronRight
                        className={`w-3 h-3 mt-0.5 flex-shrink-0 ${toneText}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* === SDK section === */}
      <Section
        eyebrow="04.5"
        title="Also ships as an SDK"
        subtitle="The same engine powering this site, published to npm. One install and one function call — every developer can launch real tokens on BSC."
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="glass-panel holo-border p-6 sm:p-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5 pb-4 border-b border-memeos-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-memeos-cyan/10 border border-memeos-cyan/30 flex items-center justify-center">
                <Package className="w-4 h-4 text-memeos-cyan" />
              </div>
              <div>
                <div className="font-mono text-sm text-memeos-text font-semibold">memeos-sdk</div>
                <div className="font-mono text-[10px] text-memeos-text-muted">v0.1.1 · MIT · Published on npm</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.npmjs.com/package/memeos-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md border border-memeos-cyan/40 bg-memeos-cyan/10 text-memeos-cyan hover:bg-memeos-cyan/20 transition-all"
              >
                <Package className="w-3 h-3" />
                npm
              </a>
              <a
                href="https://github.com/martinvibes/MemeOS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md border border-memeos-violet/40 bg-memeos-violet/10 text-memeos-violet hover:bg-memeos-violet/20 transition-all"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            </div>
          </div>

          <p className="text-memeos-text-dim text-sm leading-relaxed mb-5">
            The entire engine powering this site — agents, orchestrator, critique loop, and on-chain deployment — is published as an npm package. Embed the full MemeOS pipeline in any app with a single function call.
          </p>

          <pre className="bg-memeos-bg border border-memeos-border rounded-md p-4 font-mono text-[12px] leading-relaxed overflow-x-auto mb-4">
            <code className="text-memeos-text-dim">
              <span className="text-memeos-text-muted">$ </span>
              <span className="text-memeos-emerald">npm install memeos-sdk</span>
              {'\n\n'}
              <span className="text-memeos-violet">import</span>{' '}
              <span className="text-memeos-text">{'{ MemeOS }'}</span>{' '}
              <span className="text-memeos-violet">from</span>{' '}
              <span className="text-memeos-amber">{"'memeos-sdk'"}</span>
              {'\n\n'}
              <span className="text-memeos-violet">const</span>{' '}
              <span className="text-memeos-text">os</span>{' '}
              <span className="text-memeos-text-muted">=</span>{' '}
              <span className="text-memeos-violet">new</span>{' '}
              <span className="text-memeos-cyan">MemeOS</span>
              <span className="text-memeos-text-muted">{'({ anthropicKey, privateKey })'}</span>
              {'\n\n'}
              <span className="text-memeos-violet">const</span>{' '}
              <span className="text-memeos-text">empire</span>{' '}
              <span className="text-memeos-text-muted">=</span>{' '}
              <span className="text-memeos-violet">await</span>{' '}
              <span className="text-memeos-text">os</span>
              <span className="text-memeos-text-muted">.</span>
              <span className="text-memeos-cyan">launch</span>
              <span className="text-memeos-text-muted">(</span>
              <span className="text-memeos-amber">{"'zen samurai frog'"}</span>
              <span className="text-memeos-text-muted">)</span>
              {'\n\n'}
              <span className="text-memeos-text-muted">// empire.token.tokenAddress  — real BSC contract</span>
              {'\n'}
              <span className="text-memeos-text-muted">// empire.virality.score      — 0-100 viral score</span>
              {'\n'}
              <span className="text-memeos-text-muted">// empire.narrative.tweets    — ready-to-post</span>
            </code>
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { method: 'os.launch()', desc: 'End-to-end: agents → deploy → virality' },
              { method: 'os.generate()', desc: 'Agents only, no deploy (preview flows)' },
              { method: 'os.deploy()', desc: 'Standalone on-chain deploy' },
              { method: 'os.monitor()', desc: 'Live BSC polling for trades + holders' },
              { method: 'os.getVirality()', desc: 'Score any concept 0-100' },
              { method: 'os.getRecentDeploys()', desc: 'Query the global deploy store' },
            ].map((item) => (
              <div key={item.method} className="flex items-start gap-2 text-xs">
                <ChevronRight className="w-3 h-3 text-memeos-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <code className="font-mono text-memeos-cyan">{item.method}</code>
                  <span className="text-memeos-text-muted font-mono ml-2">— {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* === Section 5: CTA === */}
      <section className="relative max-w-4xl mx-auto px-4 pt-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="glass-panel holo-border scan-lines p-10 sm:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-memeos-cyan/5 via-transparent to-memeos-violet/10 pointer-events-none" />

          <div className="relative">
            <p className="font-mono text-[10px] tracking-[0.3em] text-memeos-cyan mb-4">
              // READY FOR DEPLOYMENT
            </p>
            <h2 className="font-mono font-bold text-3xl sm:text-5xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-memeos-cyan to-memeos-violet bg-clip-text text-transparent">
                Your empire is one prompt away.
              </span>
            </h2>
            <p className="font-sans text-memeos-text-dim text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Describe the vibe. The swarm does the rest. A real token, a real
              passport, a real on-chain presence.
            </p>

            <button
              onClick={() => router.push('/')}
              className="group inline-flex items-center gap-3 font-mono font-bold tracking-[0.25em] text-sm uppercase px-8 py-4 rounded-md bg-memeos-cyan text-memeos-bg hover:bg-memeos-cyan/90 transition-all hover:shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4" />
              Launch Your Empire
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-memeos-text-muted mt-8">
              Deploys on BSC Mainnet | Powered by four.meme
            </p>
          </div>
        </motion.div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-memeos-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-memeos-cyan" />
            <span className="font-mono text-memeos-cyan text-sm font-bold tracking-wider">
              MEMEOS
            </span>
            <span className="font-mono text-[10px] text-memeos-text-muted">
              v1.0
            </span>
          </div>
          <p className="font-mono text-[10px] text-memeos-text-muted tracking-[0.2em] uppercase">
            Powered by Claude AI x four.meme x Bitquery x BSC
          </p>
        </div>
      </footer>
    </main>
  )
}

// ----- Reusable Section component -----

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-memeos-cyan" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-memeos-cyan">
            {eyebrow}
          </span>
        </div>
        <h2 className="font-mono font-bold text-2xl sm:text-4xl tracking-tight text-memeos-text mb-3">
          {title}
        </h2>
        <p className="font-sans text-memeos-text-dim text-sm sm:text-base max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </motion.div>
      {children}
    </section>
  )
}
