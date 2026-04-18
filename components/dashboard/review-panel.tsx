'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Sparkles,
  ImageIcon,
  ScrollText,
  MessageSquare,
  Rocket,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Pencil,
  Share2,
} from 'lucide-react'
import { GlassPanel } from '@/components/ui/glass-panel'
import { GlowButton } from '@/components/ui/glow-button'
import { useStore } from '@/lib/store'
import { useDeployToken } from '@/lib/hooks'

// ─── Animation Variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, delay: i * 0.08, ease: 'easeOut' },
  }),
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  accent = 'cyan',
}: {
  icon: React.ElementType
  label: string
  accent?: 'cyan' | 'violet' | 'amber' | 'emerald'
}) {
  const accentColors = {
    cyan: 'text-memeos-cyan',
    violet: 'text-memeos-violet',
    amber: 'text-memeos-amber',
    emerald: 'text-memeos-emerald',
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} className={accentColors[accent]} />
      <span className={`font-mono text-xs uppercase tracking-[0.18em] ${accentColors[accent]}`}>
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-memeos-border to-transparent" />
    </div>
  )
}

// ─── Token Identity Section ────────────────────────────────────────────────

function TokenIdentitySection({
  customName,
  setCustomName,
  customTicker,
  setCustomTicker,
}: {
  customName: string
  setCustomName: (v: string) => void
  customTicker: string
  setCustomTicker: (v: string) => void
}) {
  const { generated, selectedNameIndex, setSelectedNameIndex } = useStore()
  if (!generated) return null
  const { names } = generated.concept

  const hasCustom = customName.trim().length > 0

  return (
    <motion.div variants={sectionVariants}>
      <GlassPanel glow="cyan" animate={false}>
        <SectionHeader icon={Sparkles} label="Token Identity" accent="cyan" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {names.map((candidate, i) => {
            const isSelected = !hasCustom && i === selectedNameIndex
            return (
              <motion.button
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedNameIndex(i)
                  setCustomName('')
                  setCustomTicker('')
                }}
                className={`
                  relative text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? 'border-memeos-cyan/60 bg-memeos-cyan/5 shadow-[0_0_20px_rgba(0,229,255,0.15),inset_0_0_20px_rgba(0,229,255,0.04)]'
                      : 'border-memeos-border bg-memeos-surface/40 hover:border-memeos-border/80 hover:bg-memeos-surface/60'
                  }
                `}
              >
                {/* Selected indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-memeos-cyan flex items-center justify-center"
                    >
                      <Check size={11} className="text-memeos-bg" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Holographic corner accent */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden rounded-tl-xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-memeos-cyan to-transparent" />
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-memeos-cyan to-transparent" />
                  </div>
                )}

                <div className="mb-2">
                  <span
                    className={`font-mono text-lg font-bold leading-tight block ${
                      isSelected ? 'text-memeos-cyan' : 'text-memeos-text'
                    }`}
                  >
                    {candidate.name}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold tracking-widest ${
                      isSelected ? 'text-memeos-cyan/70' : 'text-memeos-text-dim'
                    }`}
                  >
                    ${candidate.ticker}
                  </span>
                </div>

                <p className="text-memeos-text-muted text-xs leading-relaxed line-clamp-3">
                  {candidate.reasoning}
                </p>

                {i === 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-memeos-amber/10 border border-memeos-amber/20">
                    <span className="text-memeos-amber text-[10px] font-mono uppercase tracking-wider">AI Pick</span>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Custom name input */}
        <div className="mt-4 pt-4 border-t border-memeos-border">
          <div className="flex items-center gap-2 mb-3">
            <Pencil size={12} className="text-memeos-cyan/60" />
            <span className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest">
              Or name it yourself
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Token name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-memeos-surface/60 border border-memeos-border text-memeos-text text-sm font-mono placeholder:text-memeos-text-muted/40 focus:outline-none focus:border-memeos-cyan/50 focus:ring-1 focus:ring-memeos-cyan/20 transition-colors"
            />
            <input
              type="text"
              placeholder="TICKER"
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg bg-memeos-surface/60 border border-memeos-border text-memeos-text text-sm font-mono uppercase tracking-widest placeholder:text-memeos-text-muted/40 focus:outline-none focus:border-memeos-cyan/50 focus:ring-1 focus:ring-memeos-cyan/20 transition-colors"
            />
          </div>
          {hasCustom && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-memeos-cyan flex items-center justify-center">
                <Check size={10} className="text-memeos-bg" strokeWidth={3} />
              </div>
              <span className="text-memeos-cyan text-xs font-mono">
                Using custom name: {customName} {customTicker ? `($${customTicker})` : ''}
              </span>
            </motion.div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}

// ─── Character Art Section ─────────────────────────────────────────────────

function CharacterArtSection({
  selectedImageIndex,
  setSelectedImageIndex,
  uploadedImageUrl,
  setUploadedImageUrl,
  uploadedLocalPath,
  setUploadedLocalPath,
}: {
  selectedImageIndex: number
  setSelectedImageIndex: (v: number) => void
  uploadedImageUrl: string | null
  setUploadedImageUrl: (v: string | null) => void
  uploadedLocalPath: string | null
  setUploadedLocalPath: (v: string | null) => void
}) {
  const { generated } = useStore()
  const [uploading, setUploading] = useState(false)
  if (!generated) return null
  const { imageUrl, styleDescription, allImageUrls } = generated.image

  // 2 AI images + optional upload
  const aiImages = allImageUrls && allImageUrls.length > 0 ? allImageUrls.slice(0, 2) : [imageUrl]

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.localPath) {
        const objectUrl = URL.createObjectURL(file)
        setUploadedImageUrl(objectUrl)
        setUploadedLocalPath(data.localPath)
        setSelectedImageIndex(aiImages.length) // select the uploaded image
      }
    } finally {
      setUploading(false)
    }
  }

  const allImages = uploadedImageUrl ? [...aiImages, uploadedImageUrl] : aiImages

  return (
    <motion.div variants={sectionVariants}>
      <GlassPanel glow="violet" animate={false}>
        <SectionHeader icon={ImageIcon} label="Character Art" accent="violet" />

        <div className="grid grid-cols-3 gap-3 mb-4">
          {allImages.map((url, i) => {
            const isSelected = i === selectedImageIndex
            const label = i < aiImages.length ? `AI ${i + 1}` : 'Your Upload'
            return (
              <motion.button
                key={`img-${i}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedImageIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group ${
                  isSelected
                    ? 'border-memeos-cyan shadow-[0_0_24px_rgba(0,229,255,0.25)]'
                    : 'border-memeos-border hover:border-memeos-violet/40'
                }`}
              >
                <img
                  src={url}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-2 left-2 w-5 h-5 rounded-full bg-memeos-cyan flex items-center justify-center"
                    >
                      <Check size={11} className="text-memeos-bg" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-0 inset-x-0 bg-memeos-bg/70 backdrop-blur-sm py-1 text-center">
                  <span className="font-mono text-[9px] text-memeos-text-dim uppercase tracking-wider">{label}</span>
                </div>
              </motion.button>
            )
          })}

          {/* Upload slot — only show if no upload yet */}
          {!uploadedImageUrl && (
            <label className={`relative aspect-square rounded-xl border-2 border-dashed border-memeos-border hover:border-memeos-violet/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 bg-memeos-surface/30 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <ImageIcon size={24} className="text-memeos-text-muted" />
              <span className="font-mono text-[10px] text-memeos-text-muted uppercase">
                {uploading ? 'Uploading...' : 'Upload yours'}
              </span>
            </label>
          )}
        </div>

        <p className="font-mono text-[10px] text-memeos-text-muted">{styleDescription}</p>
      </GlassPanel>
    </motion.div>
  )
}

// ─── Narrative Section ─────────────────────────────────────────────────────

function NarrativeSection({
  editedLore,
  setEditedLore,
  editedTaglines,
  setEditedTaglines,
}: {
  editedLore: string
  setEditedLore: (v: string) => void
  editedTaglines: string[]
  setEditedTaglines: (v: string[]) => void
}) {
  const { generated } = useStore()
  const [tweetsExpanded, setTweetsExpanded] = useState(false)
  if (!generated) return null
  const { tweets } = generated.narrative

  return (
    <motion.div variants={sectionVariants}>
      <GlassPanel glow="amber" animate={false}>
        <SectionHeader icon={ScrollText} label="Narrative" accent="amber" />

        {/* Lore */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest">
              Origin Lore
            </p>
            <Pencil size={10} className="text-memeos-text-muted/50" />
          </div>
          <div className="relative rounded-lg bg-memeos-surface/50 border border-memeos-border focus-within:border-memeos-amber/40 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg bg-gradient-to-b from-memeos-amber/60 via-memeos-amber/30 to-transparent" />
            <textarea
              value={editedLore}
              onChange={(e) => setEditedLore(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-memeos-text text-sm leading-relaxed p-4 pl-5 resize-y focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Taglines */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest">
              Taglines
            </p>
            <Pencil size={10} className="text-memeos-text-muted/50" />
          </div>
          <div className="flex flex-col gap-2">
            {editedTaglines.slice(0, 3).map((tagline, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-2"
              >
                <span className="text-memeos-amber/50 font-mono text-xs shrink-0">&quot;</span>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => {
                    const updated = [...editedTaglines]
                    updated[i] = e.target.value
                    setEditedTaglines(updated)
                  }}
                  className="flex-1 px-3 py-1.5 rounded-full border border-memeos-amber/30 bg-memeos-amber/5 text-memeos-amber text-xs font-mono focus:outline-none focus:border-memeos-amber/60 focus:ring-1 focus:ring-memeos-amber/20 transition-colors"
                />
                <span className="text-memeos-amber/50 font-mono text-xs shrink-0">&quot;</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tweets - collapsible */}
        <div>
          <button
            onClick={() => setTweetsExpanded((v) => !v)}
            className="flex items-center gap-2 font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest mb-2 hover:text-memeos-text transition-colors group"
          >
            <MessageSquare size={11} />
            <span>Sample Tweets ({tweets.length})</span>
            {tweetsExpanded ? (
              <ChevronUp size={11} className="group-hover:text-memeos-amber transition-colors" />
            ) : (
              <ChevronDown size={11} className="group-hover:text-memeos-amber transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {tweetsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {tweets.map((tweet, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-3 rounded-lg bg-memeos-surface/30 border border-memeos-border text-memeos-text-dim text-xs leading-relaxed font-mono"
                    >
                      <span className="text-memeos-amber/60 mr-1.5">@</span>
                      {tweet}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  )
}

// ─── Community Pack Section ────────────────────────────────────────────────

function CommunityPackSection() {
  const { generated } = useStore()
  if (!generated) return null
  const { welcome, rules } = generated.narrative.communityPack

  return (
    <motion.div variants={sectionVariants}>
      <GlassPanel animate={false}>
        <SectionHeader icon={MessageSquare} label="Community Pack" accent="emerald" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Welcome message - terminal style */}
          <div className="rounded-lg overflow-hidden border border-memeos-emerald/20">
            <div className="flex items-center gap-2 px-3 py-2 bg-memeos-emerald/5 border-b border-memeos-emerald/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-memeos-amber/60" />
                <div className="w-2 h-2 rounded-full bg-memeos-emerald/60" />
              </div>
              <span className="font-mono text-[10px] text-memeos-emerald uppercase tracking-widest">
                welcome.md
              </span>
            </div>
            <div className="p-3 bg-memeos-bg/70 font-mono text-xs leading-relaxed text-memeos-text-dim min-h-[80px]">
              <span className="text-memeos-emerald">$ </span>
              <span className="text-memeos-text-dim">{welcome}</span>
            </div>
          </div>

          {/* Rules - terminal style */}
          <div className="rounded-lg overflow-hidden border border-memeos-violet/20">
            <div className="flex items-center gap-2 px-3 py-2 bg-memeos-violet/5 border-b border-memeos-violet/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-memeos-amber/60" />
                <div className="w-2 h-2 rounded-full bg-memeos-emerald/60" />
              </div>
              <span className="font-mono text-[10px] text-memeos-violet uppercase tracking-widest">
                rules.md
              </span>
            </div>
            <div className="p-3 bg-memeos-bg/70 font-mono text-xs leading-relaxed text-memeos-text-dim min-h-[80px]">
              <span className="text-memeos-violet">$ </span>
              <span className="text-memeos-text-dim">{rules}</span>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  )
}

// ─── Deploy Section ────────────────────────────────────────────────────────

function DeploySection({
  onDeploy,
  isDeploying,
  onShareToX,
}: {
  onDeploy: () => void
  isDeploying: boolean
  onShareToX: () => void
}) {
  return (
    <motion.div
      variants={sectionVariants}
      className="relative"
    >
      {/* Ambient glow behind button */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-memeos-cyan/5 to-transparent rounded-b-2xl pointer-events-none" />

      <div className="flex flex-col items-center gap-4 py-6">
        {/* Separator line with glow */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-memeos-cyan/30 to-transparent mb-2" />

        <div className="flex items-center gap-4">
          <motion.div
            animate={isDeploying ? {} : { boxShadow: ['0 0 0px rgba(0,229,255,0)', '0 0 24px rgba(0,229,255,0.15)', '0 0 0px rgba(0,229,255,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-xl"
          >
            <GlowButton
              variant="cyan"
              size="lg"
              loading={isDeploying}
              onClick={onDeploy}
              className="flex items-center gap-3 text-base font-bold tracking-[0.2em] px-12 py-4"
            >
              <Rocket size={18} className={isDeploying ? 'opacity-0' : ''} />
              Deploy to BSC
            </GlowButton>
          </motion.div>

          <button
            onClick={onShareToX}
            className="flex items-center gap-2 px-5 py-4 rounded-xl border border-memeos-border bg-memeos-surface/50 text-memeos-text hover:bg-memeos-surface hover:border-memeos-text-dim transition-all duration-200 font-mono text-sm font-bold tracking-wide"
          >
            <Share2 size={16} />
            Share to X
          </button>
        </div>

        <p className="font-mono text-[10px] text-memeos-text-muted uppercase tracking-widest text-center">
          Deploys via Four.meme on BNB Smart Chain
        </p>
      </div>
    </motion.div>
  )
}

// ─── Selected Name Badge ───────────────────────────────────────────────────

function SelectedNameBadge({
  customName,
  customTicker,
}: {
  customName: string
  customTicker: string
}) {
  const { generated, selectedNameIndex } = useStore()
  if (!generated) return null
  const selected = generated.concept.names[selectedNameIndex]
  if (!selected) return null

  const displayName = customName.trim() || selected.name
  const displayTicker = customTicker.trim() || selected.ticker

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <h2 className="text-xl font-bold text-memeos-text tracking-tight">
          Review &amp; Deploy
        </h2>
        <p className="text-memeos-text-muted text-xs mt-0.5">
          Confirm your token before it goes live
        </p>
      </div>

      <motion.div
        key={`${displayName}-${displayTicker}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-end gap-0.5"
      >
        <span className="font-mono font-bold text-memeos-cyan text-lg leading-tight">
          {displayName}
        </span>
        <span className="font-mono text-memeos-cyan/60 text-xs tracking-[0.2em] uppercase">
          ${displayTicker}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function ReviewPanel() {
  const { generated, selectedNameIndex, phase } = useStore()
  const { deploy } = useDeployToken()

  // Editable state
  const [customName, setCustomName] = useState('')
  const [customTicker, setCustomTicker] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [editedLore, setEditedLore] = useState('')
  const [editedTaglines, setEditedTaglines] = useState<string[]>([])
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedLocalPath, setUploadedLocalPath] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize editable state from generated data
  if (generated && !initialized) {
    setEditedLore(generated.narrative.lore)
    setEditedTaglines([...generated.narrative.taglines])
    setInitialized(true)
  }

  const isDeploying = phase === 'deploying'

  const getEffectiveName = () => {
    if (!generated) return { name: '', ticker: '' }
    if (customName.trim()) {
      return { name: customName.trim(), ticker: customTicker.trim() || customName.trim().toUpperCase().slice(0, 5) }
    }
    const selected = generated.concept.names[selectedNameIndex]
    return { name: selected.name, ticker: selected.ticker }
  }

  const getEffectiveTagline = () => {
    return editedTaglines[0] || ''
  }

  const handleDeploy = () => {
    if (!generated) return

    const concept = { ...generated.concept }
    const { name, ticker } = getEffectiveName()

    // Build names array with the effective name at position 0
    if (customName.trim()) {
      concept.names = [
        { name, ticker, reasoning: 'Custom name chosen by user' },
        ...concept.names,
      ]
    } else {
      const selected = concept.names[selectedNameIndex]
      concept.names = [selected, ...concept.names.filter((_, i) => i !== selectedNameIndex)]
    }

    // Build narrative with edits
    const narrative = {
      ...generated.narrative,
      lore: editedLore,
      taglines: editedTaglines,
    }

    // Build visuals with selected image
    const visuals = { ...generated.image }
    const aiImages = generated.image.allImageUrls?.slice(0, 2) || [generated.image.imageUrl]

    if (uploadedImageUrl && selectedImageIndex >= aiImages.length) {
      // User selected their uploaded image
      visuals.imageUrl = uploadedImageUrl
      visuals.localPath = uploadedLocalPath || undefined
    } else {
      const allUrls = generated.image.allImageUrls
      const allPaths = generated.image.allLocalPaths
      if (allUrls && allUrls[selectedImageIndex]) {
        visuals.imageUrl = allUrls[selectedImageIndex]
      }
      if (allPaths && allPaths[selectedImageIndex]) {
        visuals.localPath = allPaths[selectedImageIndex]
      }
    }

    deploy({ concept, narrative, visuals })
  }

  const handleShareToX = () => {
    const { ticker } = getEffectiveName()
    const tagline = getEffectiveTagline()
    const tweetText = `Just launched $${ticker} on @four_meme_  powered by MemeOS! 🚀\n\n${tagline}\n\n#FourMeme #BSC #MemeOS #BNBChain #AI #Hackathon`
    const encoded = encodeURIComponent(tweetText)
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank')
  }

  if (!generated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw size={24} className="text-memeos-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-memeos-text-muted text-sm font-mono">Awaiting generation...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SelectedNameBadge customName={customName} customTicker={customTicker} />

      <div className="flex flex-col gap-4">
        <TokenIdentitySection
          customName={customName}
          setCustomName={setCustomName}
          customTicker={customTicker}
          setCustomTicker={setCustomTicker}
        />
        <CharacterArtSection
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          uploadedLocalPath={uploadedLocalPath}
          setUploadedLocalPath={setUploadedLocalPath}
        />
        <NarrativeSection
          editedLore={editedLore}
          setEditedLore={setEditedLore}
          editedTaglines={editedTaglines}
          setEditedTaglines={setEditedTaglines}
        />
        <CommunityPackSection />
        <DeploySection onDeploy={handleDeploy} isDeploying={isDeploying} onShareToX={handleShareToX} />
      </div>
    </motion.div>
  )
}
