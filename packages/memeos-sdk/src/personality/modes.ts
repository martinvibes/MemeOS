export type PersonalityMode =
  | 'aggressive'
  | 'zen'
  | 'chaotic'
  | 'degen'
  | 'aesthetic'
  | 'balanced' // default — no override

export interface PersonalityModeInfo {
  id: PersonalityMode
  label: string
  tagline: string
  accent: 'cyan' | 'violet' | 'amber' | 'emerald' | 'red'
  promptSuffix: string
}

export const PERSONALITY_MODES: Record<PersonalityMode, PersonalityModeInfo> = {
  balanced: {
    id: 'balanced',
    label: 'BALANCED',
    tagline: 'The default swarm voice.',
    accent: 'cyan',
    promptSuffix: '',
  },
  aggressive: {
    id: 'aggressive',
    label: 'AGGRESSIVE',
    tagline: 'Dominance. Alpha. Maximum impact.',
    accent: 'red',
    promptSuffix: `
PERSONALITY MODE: AGGRESSIVE
- Lean into dominance, conquest, and alpha-predator energy
- Names should be short, punchy, intimidating — think $ALPHA, $RAID, $APEX
- Lore should feature power, hierarchy, and competitive triumph
- Taglines should sound like war cries, not invitations
- Humor is cutting and confident, never soft`,
  },
  zen: {
    id: 'zen',
    label: 'ZEN',
    tagline: 'Calm mind. Diamond hands. Eternal HODL.',
    accent: 'emerald',
    promptSuffix: `
PERSONALITY MODE: ZEN
- Lean into meditation, patience, and spiritual stoicism
- Names should evoke nature, balance, stillness — think $LOTUS, $WAVE, $DOJO
- Lore should read like ancient wisdom applied to crypto
- Taglines should sound like koans, not sales pitches
- Humor is subtle, Eastern-philosophy-adjacent, never frantic`,
  },
  chaotic: {
    id: 'chaotic',
    label: 'CHAOTIC',
    tagline: 'Embrace the glitch. Break the matrix.',
    accent: 'violet',
    promptSuffix: `
PERSONALITY MODE: CHAOTIC
- Lean into absurdity, non-sequiturs, and dimensional instability
- Names should feel like glitches or corrupted files — think $404, $GLTCH, $VOID
- Lore should read like it's being written by a broken oracle
- Taglines should be slightly incomprehensible but emotionally resonant
- Humor is surreal, cursed, and unpredictable — NEVER explain the joke`,
  },
  degen: {
    id: 'degen',
    label: 'DEGEN',
    tagline: 'Pure on-chain insanity. Aped in. No exits.',
    accent: 'amber',
    promptSuffix: `
PERSONALITY MODE: DEGEN
- Lean into full-send gambling energy, crypto native slang, and reckless optimism
- Names should sound like terminal online culture — think $BASED, $SEND, $NGMI
- Lore should reference leverage, liquidations, and 100x dreams
- Taglines should sound like a trading floor at 4am
- Humor is self-aware, extremely online, and borderline financially irresponsible`,
  },
  aesthetic: {
    id: 'aesthetic',
    label: 'AESTHETIC',
    tagline: 'Pure vibe. Y2K meets vaporwave meets cyberpunk.',
    accent: 'violet',
    promptSuffix: `
PERSONALITY MODE: AESTHETIC
- Lean into vaporwave, Y2K, liminal spaces, cyberpunk atmosphere
- Names should feel like art — think $NEON, $DREAM, $STATIC
- Lore should read like poetry — evocative, visual, slightly melancholic
- Taglines should be image-first, not information-first
- Humor is ironic, detached, visually-driven`,
  },
}
