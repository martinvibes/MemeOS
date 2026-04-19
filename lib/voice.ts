'use client'

/**
 * Agent Voice — each AI agent literally speaks its reasoning via the Web Speech API.
 *
 * Behaviors:
 * - Opt-in: default off, persisted in localStorage under 'memeos-voice-enabled'
 * - Distinct voice profile per agent (rate/pitch variations)
 * - Per-agent cancellation so outdated mid-flight utterances don't pile up
 * - Graceful no-op on SSR / browsers without speechSynthesis
 */

export interface VoiceProfile {
  agent: string
  displayName: string
  rate: number
  pitch: number
  voiceURI?: string
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'market-analyst': {
    agent: 'market-analyst',
    displayName: 'Market Analyst',
    rate: 1.05,
    pitch: 0.85,
  },
  'concept-architect': {
    agent: 'concept-architect',
    displayName: 'Concept Architect',
    rate: 1.0,
    pitch: 1.15,
  },
  'visual-director': {
    agent: 'visual-director',
    displayName: 'Visual Director',
    rate: 1.1,
    pitch: 1.05,
  },
  'narrative-designer': {
    agent: 'narrative-designer',
    displayName: 'Narrative Designer',
    rate: 0.95,
    pitch: 1.25,
  },
  'launch-commander': {
    agent: 'launch-commander',
    displayName: 'Launch Commander',
    rate: 1.15,
    pitch: 0.75,
  },
}

const STORAGE_KEY = 'memeos-voice-enabled'
const MAX_CHARS = 180

// Preferred voice name hints (matched case-insensitively by substring)
const PREFERRED_VOICE_HINTS = ['Google', 'Samantha', 'Daniel', 'Karen', 'Alex']

// Track the latest utterance per agent so we can cancel outdated ones
const activeUtterances: Map<string, SpeechSynthesisUtterance> = new Map()

function hasSpeech(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

export function isVoiceEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setVoiceEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
  if (!enabled && hasSpeech()) {
    stopSpeaking()
  }
}

export function stopSpeaking(): void {
  if (!hasSpeech()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
  activeUtterances.clear()
}

export function getBestVoiceFor(profile: VoiceProfile): SpeechSynthesisVoice | null {
  if (!hasSpeech()) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  // If a specific URI is requested, try to match it first
  if (profile.voiceURI) {
    const exact = voices.find((v) => v.voiceURI === profile.voiceURI)
    if (exact) return exact
  }

  // Prefer voices whose name contains one of our hints AND is English
  for (const hint of PREFERRED_VOICE_HINTS) {
    const hinted = voices.find(
      (v) =>
        v.name.toLowerCase().includes(hint.toLowerCase()) &&
        v.lang.toLowerCase().startsWith('en'),
    )
    if (hinted) return hinted
  }

  // Fallback: any English voice
  const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith('en'))
  if (anyEn) return anyEn

  // Last resort: first voice
  return voices[0] || null
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text
  return text.slice(0, MAX_CHARS).replace(/\s+\S*$/, '') + '...'
}

export function speak(agent: string, text: string): void {
  if (!hasSpeech()) return
  if (!isVoiceEnabled()) return
  if (!text || !text.trim()) return

  const profile = VOICE_PROFILES[agent]

  // Cancel any prior utterance for this agent to avoid stacking
  const prior = activeUtterances.get(agent)
  if (prior) {
    try {
      // There's no per-utterance cancel; we blow away the whole queue. That's OK —
      // the swarm is serial per-agent in practice, and canceling a stale line is fine.
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    activeUtterances.delete(agent)
  }

  const utter = new SpeechSynthesisUtterance(truncate(text))
  if (profile) {
    utter.rate = profile.rate
    utter.pitch = profile.pitch
    const voice = getBestVoiceFor(profile)
    if (voice) utter.voice = voice
  } else {
    // Neutral fallback profile
    utter.rate = 1.0
    utter.pitch = 0.95
    const voice = getBestVoiceFor({
      agent: 'system',
      displayName: 'MemeOS',
      rate: 1.0,
      pitch: 0.95,
    })
    if (voice) utter.voice = voice
  }
  utter.volume = 1

  utter.onend = () => {
    if (activeUtterances.get(agent) === utter) {
      activeUtterances.delete(agent)
    }
  }
  utter.onerror = () => {
    if (activeUtterances.get(agent) === utter) {
      activeUtterances.delete(agent)
    }
  }

  activeUtterances.set(agent, utter)
  try {
    window.speechSynthesis.speak(utter)
  } catch {
    /* ignore */
  }
}
