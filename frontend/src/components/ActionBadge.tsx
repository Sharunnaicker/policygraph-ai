import type { ActionType, PolicyResult } from '../types'

interface Props {
  result: PolicyResult
  large?: boolean
}

const actionConfig: Record<ActionType, { label: string; cls: string }> = {
  ASK_CLARIFYING_QUESTION: {
    label: 'ASK CLARIFYING QUESTION',
    cls: 'bg-blue-900/50 text-blue-300 border-blue-700',
  },
  RETRIEVE_DOCS: {
    label: 'RETRIEVE DOCS',
    cls: 'bg-violet-900/50 text-violet-300 border-violet-700',
  },
  ESCALATE_TO_HUMAN: {
    label: 'ESCALATE TO HUMAN',
    cls: 'bg-red-900/50 text-red-300 border-red-700',
  },
  UPGRADE_MODEL: {
    label: 'UPGRADE MODEL',
    cls: 'bg-amber-900/50 text-amber-300 border-amber-700',
  },
  TRIGGER_WORKFLOW: {
    label: 'TRIGGER WORKFLOW',
    cls: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  },
}

export function ActionChip({ action }: { action: ActionType }) {
  const cfg = actionConfig[action]
  return (
    <span className={`inline-flex text-xs font-mono font-semibold px-2 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export default function ActionBadge({ result, large = false }: Props) {
  const cfg = actionConfig[result.action]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2">
      <span className={`inline-flex font-mono font-bold rounded border ${large ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'} ${cfg.cls}`}>
        {cfg.label}
      </span>
      <div className="space-y-1">
        <div className="flex gap-2">
          <span className="text-zinc-500 font-mono text-xs w-24 shrink-0">triggered_rule</span>
          <span className="font-mono text-xs text-zinc-300 break-all">{result.triggered_rule}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-zinc-500 font-mono text-xs w-24 shrink-0">reason</span>
          <span className="text-xs text-zinc-400 break-words">{result.reason}</span>
        </div>
      </div>
    </div>
  )
}
