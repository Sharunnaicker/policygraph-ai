import type { Decision } from '../types'
import BeliefCard from './BeliefCard'
import ActionBadge from './ActionBadge'

interface Props {
  decision: Decision
}

const steps = [
  { num: 1, label: 'Raw Input' },
  { num: 2, label: 'Extracted Beliefs' },
  { num: 3, label: 'Policy Evaluated' },
  { num: 4, label: 'Action Selected' },
]

export default function PolicyTrace({ decision }: Props) {
  const policyResult = {
    action: decision.action,
    reason: decision.reason,
    triggered_rule: decision.triggered_rule,
  }

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.num} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 shrink-0">
              {step.num}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-zinc-800 my-1" />
            )}
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">{step.label}</p>
            {step.num === 1 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <p className="font-mono text-xs text-zinc-300 break-words line-clamp-4">
                  {decision.input_text}
                </p>
              </div>
            )}
            {step.num === 2 && <BeliefCard belief={decision.belief_state} />}
            {step.num === 3 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-mono text-xs w-24 shrink-0">triggered_rule</span>
                  <span className="font-mono text-xs text-zinc-200">{decision.triggered_rule}</span>
                </div>
              </div>
            )}
            {step.num === 4 && <ActionBadge result={policyResult} large />}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
        <span className="text-zinc-500 text-xs">latency</span>
        <span className="font-mono text-xs text-zinc-300">{decision.latency_ms}ms</span>
      </div>
    </div>
  )
}
