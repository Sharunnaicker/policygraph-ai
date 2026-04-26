import type { BeliefState } from '../types'

interface Props {
  belief: BeliefState
}

const urgencyConfig = {
  low: { label: 'LOW', cls: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  medium: { label: 'MEDIUM', cls: 'bg-amber-900/60 text-amber-300 border-amber-700' },
  high: { label: 'HIGH', cls: 'bg-red-900/60 text-red-300 border-red-700' },
}

const tierConfig = {
  free: 'bg-zinc-800 text-zinc-400 border-zinc-600',
  pro: 'bg-blue-900/50 text-blue-300 border-blue-700',
  enterprise: 'bg-violet-900/50 text-violet-300 border-violet-700',
}

export default function BeliefCard({ belief }: Props) {
  const urgency = urgencyConfig[belief.urgency]
  const tierCls = tierConfig[belief.customer_tier]
  const confidencePct = Math.round(belief.confidence * 100)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2.5 text-sm">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-zinc-400 text-xs uppercase tracking-wider">Belief State</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${urgency.cls}`}>
          {urgency.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <Row label="topic">
          <span className="font-mono text-zinc-200">{belief.topic}</span>
        </Row>

        <Row label="confidence">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="font-mono text-zinc-300 text-xs w-9 text-right">{confidencePct}%</span>
          </div>
        </Row>

        <Row label="tier">
          <span className={`text-xs font-mono px-2 py-0.5 rounded border uppercase ${tierCls}`}>
            {belief.customer_tier}
          </span>
        </Row>

        <Row label="ambiguity">
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${belief.ambiguity ? 'bg-orange-900/50 text-orange-300' : 'bg-zinc-800 text-zinc-400'}`}>
            {belief.ambiguity ? 'true' : 'false'}
          </span>
        </Row>

        <Row label="missing_fields">
          {belief.missing_fields.length === 0 ? (
            <span className="text-zinc-500 font-mono text-xs">none</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {belief.missing_fields.map((f) => (
                <span key={f} className="text-xs font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  {f}
                </span>
              ))}
            </div>
          )}
        </Row>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-500 font-mono text-xs w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0 flex-1">{children}</div>
    </div>
  )
}
