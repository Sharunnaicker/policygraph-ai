import type { Decision, ActionType } from '../types'

interface Props {
  decisions: Decision[]
}

const actionLabels: Record<ActionType, string> = {
  ASK_CLARIFYING_QUESTION: 'ASK CLARIFYING',
  RETRIEVE_DOCS: 'RETRIEVE DOCS',
  ESCALATE_TO_HUMAN: 'ESCALATE',
  UPGRADE_MODEL: 'UPGRADE MODEL',
  TRIGGER_WORKFLOW: 'TRIGGER WORKFLOW',
}

export default function MetricsBar({ decisions }: Props) {
  const total = decisions.length

  const avgLatency =
    total === 0
      ? 0
      : Math.round(decisions.reduce((s, d) => s + d.latency_ms, 0) / total)

  const actionCounts = decisions.reduce<Record<string, number>>((acc, d) => {
    acc[d.action] = (acc[d.action] ?? 0) + 1
    return acc
  }, {})

  const mostCommon =
    total === 0
      ? '—'
      : (actionLabels[
          Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0][0] as ActionType
        ] ?? '—')

  const escalations = decisions.filter((d) => d.action === 'ESCALATE_TO_HUMAN').length
  const escalationRate = total === 0 ? 0 : Math.round((escalations / total) * 100)

  return (
    <div className="flex items-stretch gap-px bg-zinc-800 border-b border-zinc-800">
      <Stat label="Total Decisions" value={String(total)} />
      <Stat label="Avg Latency" value={`${avgLatency}ms`} mono />
      <Stat label="Top Action" value={mostCommon} />
      <Stat
        label="Escalation Rate"
        value={`${escalationRate}%`}
        mono
        highlight={escalationRate > 20}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  mono,
  highlight,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex-1 bg-zinc-950 px-4 py-2.5 flex flex-col gap-0.5 min-w-0">
      <span className="text-zinc-500 text-xs uppercase tracking-wider truncate">{label}</span>
      <span
        className={`text-sm font-semibold truncate ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-red-400' : 'text-zinc-100'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
