import type { Metadata } from 'next'
import Link from 'next/link'
import { Terminal, ArrowRight, Crown, Sparkles } from 'lucide-react'
import { findDeploy } from '@/src/storage/deploys'
import { GlassPanel } from '@/components/ui/glass-panel'
import { LivePanels } from './live-panels'
import { EmpireActions, TweetCard, CopyAddressButton } from './client-bits'

export async function generateMetadata({
  params,
}: {
  params: { address: string }
}): Promise<Metadata> {
  const deploy = await findDeploy(params.address)
  if (!deploy) return { title: 'Empire not found — MemeOS' }
  return {
    title: `${deploy.name} ($${deploy.symbol}) — MemeOS Empire`,
    description: deploy.tagline || `Launched via MemeOS`,
    openGraph: {
      title: `${deploy.name} ($${deploy.symbol})`,
      description: deploy.tagline,
      images: deploy.imageUrl ? [deploy.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deploy.name} ($${deploy.symbol})`,
      description: deploy.tagline,
      images: deploy.imageUrl ? [deploy.imageUrl] : [],
    },
  }
}

export default async function EmpirePage({
  params,
}: {
  params: { address: string }
}) {
  const deploy = await findDeploy(params.address)

  if (!deploy) {
    return (
      <main className="min-h-screen bg-memeos-bg flex items-center justify-center px-4 scan-lines">
        <GlassPanel glow="violet" className="max-w-md w-full text-center">
          <div className="py-8">
            <Crown className="w-12 h-12 text-memeos-violet mx-auto mb-4 opacity-60" />
            <h1 className="font-mono text-2xl text-memeos-text mb-2 uppercase tracking-wider">
              Empire not found
            </h1>
            <p className="font-mono text-xs text-memeos-text-muted mb-6">
              No token record exists for
              <br />
              <span className="text-memeos-text-dim break-all">{params.address}</span>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider border border-memeos-cyan/40 text-memeos-cyan bg-memeos-cyan/10 hover:bg-memeos-cyan/20 hover:shadow-glow-cyan px-5 py-2.5 rounded-lg transition-all"
            >
              Launch your own
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassPanel>
      </main>
    )
  }

  const bscScanUrl = `https://bscscan.com/token/${deploy.tokenAddress}`
  const remixPrompt = deploy.vibePrompt
    ? `/?remix=${encodeURIComponent(deploy.vibePrompt)}`
    : '/'

  return (
    <main className="min-h-screen bg-memeos-bg scan-lines">
      {/* Top nav */}
      <header className="border-b border-memeos-border backdrop-blur-sm sticky top-0 z-40 bg-memeos-bg/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Terminal className="w-4 h-4 text-memeos-cyan group-hover:drop-shadow-[0_0_6px_rgba(0,229,255,0.8)] transition" />
            <span className="font-mono text-memeos-cyan text-sm font-bold tracking-wider">
              MEMEOS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider">
            <span>MEMEOS</span>
            <span className="text-memeos-border">/</span>
            <span>EMPIRE</span>
            <span className="text-memeos-border">/</span>
            <span className="text-memeos-cyan">${deploy.symbol}</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider border border-memeos-cyan/40 text-memeos-cyan bg-memeos-cyan/10 hover:bg-memeos-cyan/20 hover:shadow-glow-cyan px-3.5 py-2 rounded-lg transition-all"
          >
            Launch your own
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8 items-start">
          <div className="relative">
            {deploy.imageUrl ? (
              <div className="relative w-[200px] h-[200px] rounded-xl overflow-hidden border border-memeos-cyan/30 shadow-glow-cyan">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deploy.imageUrl}
                  alt={deploy.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] rounded-xl border border-memeos-border bg-memeos-surface flex items-center justify-center">
                <Crown className="w-12 h-12 text-memeos-text-muted" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="font-mono text-4xl md:text-5xl font-bold text-memeos-cyan tracking-tight leading-tight drop-shadow-[0_0_12px_rgba(0,229,255,0.35)]">
                {deploy.name}
              </h1>
              <p className="font-mono text-xl md:text-2xl text-memeos-violet mt-1">
                ${deploy.symbol}
              </p>
            </div>

            {deploy.tagline && (
              <p className="italic text-memeos-text-dim text-base md:text-lg max-w-2xl">
                &ldquo;{deploy.tagline}&rdquo;
              </p>
            )}

            {deploy.personality && deploy.personality.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deploy.personality.map((trait) => (
                  <span
                    key={trait}
                    className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-memeos-violet/40 bg-memeos-violet/10 text-memeos-violet"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
              <span className="text-memeos-text-muted uppercase tracking-wider">CA:</span>
              <a
                href={bscScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-memeos-text-dim hover:text-memeos-cyan transition break-all"
              >
                {deploy.tokenAddress}
              </a>
              <CopyAddressButton address={deploy.tokenAddress} />
            </div>

            <EmpireActions
              name={deploy.name}
              symbol={deploy.symbol}
              fourMemeUrl={deploy.fourMemeUrl}
              remixHref={remixPrompt}
              tagline={deploy.tagline}
            />
          </div>
        </section>

        {/* Lore */}
        {deploy.lore && (
          <section>
            <GlassPanel header="LORE" glow="violet">
              <div className="prose prose-invert max-w-none">
                <p className="text-memeos-text-dim text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {deploy.lore}
                </p>
              </div>
            </GlassPanel>
          </section>
        )}

        {/* Live data grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-memeos-amber" />
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-memeos-text-dim">
              Live on-chain data
            </h2>
            <div className="flex-1 h-px bg-memeos-border" />
          </div>
          <LivePanels tokenAddress={deploy.tokenAddress} />
        </section>

        {/* Tweets */}
        {deploy.tweets && deploy.tweets.length > 0 && (
          <section>
            <GlassPanel header="READY-TO-POST TWEETS" glow="cyan">
              <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-wider mb-3">
                Click any tweet to post it with #MemeOS #FourMeme
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deploy.tweets.map((tweet, i) => (
                  <TweetCard key={i} tweet={tweet} />
                ))}
              </div>
            </GlassPanel>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-memeos-border pt-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[11px] text-memeos-text-muted hover:text-memeos-cyan uppercase tracking-[0.2em] transition"
          >
            <Terminal className="w-3 h-3" />
            Powered by MemeOS
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </Link>
          <p className="font-mono text-[10px] text-memeos-text-muted">
            Launched {new Date(deploy.deployedAt).toLocaleDateString()} on BSC
          </p>
        </footer>
      </div>
    </main>
  )
}
