'use client'

import { GlassPanel } from '@/components/ui/glass-panel'
import { AgentCard } from './agent-card'
import { useStore } from '@/lib/store'

const AGENT_ORDER = [
  'market-analyst',
  'concept-architect',
  'visual-director',
  'narrative-designer',
  'launch-commander',
]

export function AgentStream() {
  const agents = useStore((s) => s.agents)

  return (
    <GlassPanel header="AGENT SWARM" glow="cyan" className="h-full">
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
        {AGENT_ORDER.map((id) => {
          const agent = agents[id]
          return (
            <AgentCard
              key={id}
              agentId={id}
              status={agent?.status || 'idle'}
              messages={agent?.messages || []}
            />
          )
        })}
      </div>
    </GlassPanel>
  )
}
