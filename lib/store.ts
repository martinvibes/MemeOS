import { create } from 'zustand'
import type { AgentEvent, Trade, PriceUpdate, Holder, ConceptBrief, NarrativePackage, VisualAssets, MarketIntel, DeployResult } from '@/src/types'

export type AppPhase = 'landing' | 'building' | 'review' | 'deploying' | 'deployed' | 'empire'

interface AgentState {
  status: 'idle' | 'running' | 'completed' | 'error'
  messages: Array<{ id: string; text: string; timestamp: number }>
}

interface GeneratedData {
  concept: ConceptBrief
  narrative: NarrativePackage
  image: VisualAssets
  market: MarketIntel
}

interface MemeOSStore {
  // Navigation
  phase: AppPhase
  setPhase: (phase: AppPhase) => void
  vibePrompt: string
  setVibePrompt: (prompt: string) => void

  // Agents
  agents: Record<string, AgentState>
  addAgentEvent: (event: AgentEvent) => void
  resetAgents: () => void

  // Generated data (pre-deploy, for review)
  generated: GeneratedData | null
  setGenerated: (data: GeneratedData) => void

  // User overrides during review
  selectedNameIndex: number
  setSelectedNameIndex: (index: number) => void

  // Deploy result
  deployResult: DeployResult | null
  setDeployResult: (result: DeployResult) => void

  // Live monitoring
  trades: Trade[]
  addTrade: (trade: Trade) => void
  priceData: PriceUpdate | null
  setPriceData: (data: PriceUpdate) => void
  holders: Holder[]
  setHolders: (holders: Holder[]) => void
  bondingCurveProgress: number
  setBondingCurveProgress: (progress: number) => void

  // Error
  error: string | null
  setError: (error: string | null) => void

  // Reset
  resetAll: () => void
}

const INITIAL_AGENTS: Record<string, AgentState> = {
  'market-analyst': { status: 'idle', messages: [] },
  'concept-architect': { status: 'idle', messages: [] },
  'visual-director': { status: 'idle', messages: [] },
  'narrative-designer': { status: 'idle', messages: [] },
  'launch-commander': { status: 'idle', messages: [] },
}

export const useStore = create<MemeOSStore>((set) => ({
  phase: 'landing',
  setPhase: (phase) => set({ phase }),
  vibePrompt: '',
  setVibePrompt: (vibePrompt) => set({ vibePrompt }),

  agents: { ...INITIAL_AGENTS },
  addAgentEvent: (event) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [event.agent]: {
          status: event.status,
          messages: [
            ...(state.agents[event.agent]?.messages || []),
            { id: `${event.agent}-${Date.now()}-${Math.random()}`, text: event.message, timestamp: event.timestamp },
          ],
        },
      },
    })),
  resetAgents: () => set({ agents: { ...INITIAL_AGENTS } }),

  generated: null,
  setGenerated: (generated) => set({ generated }),

  selectedNameIndex: 0,
  setSelectedNameIndex: (selectedNameIndex) => set({ selectedNameIndex }),

  deployResult: null,
  setDeployResult: (deployResult) => set({ deployResult }),

  trades: [],
  addTrade: (trade) =>
    set((state) => ({ trades: [trade, ...state.trades].slice(0, 100) })),
  priceData: null,
  setPriceData: (priceData) => set({ priceData }),
  holders: [],
  setHolders: (holders) => set({ holders }),
  bondingCurveProgress: 0,
  setBondingCurveProgress: (bondingCurveProgress) => set({ bondingCurveProgress }),

  error: null,
  setError: (error) => set({ error }),

  resetAll: () => set({
    phase: 'landing',
    vibePrompt: '',
    agents: { ...INITIAL_AGENTS },
    generated: null,
    selectedNameIndex: 0,
    deployResult: null,
    trades: [],
    priceData: null,
    holders: [],
    bondingCurveProgress: 0,
    error: null,
  }),
}))
