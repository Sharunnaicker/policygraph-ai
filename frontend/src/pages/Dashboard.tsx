import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDecisions, ingestText } from '../api/client'
import type { Decision, IngestResponse } from '../types'
import MetricsBar from '../components/MetricsBar'
import PolicyTrace from '../components/PolicyTrace'
import { ActionChip } from '../components/ActionBadge'

export default function Dashboard() {
  const [text, setText] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading: decisionsLoading } = useQuery({
    queryKey: ['decisions'],
    queryFn: getDecisions,
    refetchInterval: 5000,
  })

  const decisions = data?.decisions ?? []

  const mutation = useMutation({
    mutationFn: ingestText,
    onSuccess: (res: IngestResponse) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
      setSelectedId(res.decision_id)
      setText('')
    },
  })

  const selectedDecision = decisions.find((d) => d.id === selectedId) ?? null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-200">
      <header className="shrink-0 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-zinc-100 tracking-tight">
          PolicyGraph AI
        </span>
        <span className="text-zinc-600 text-xs">decision engine</span>
      </header>

      <MetricsBar decisions={decisions} />

      <div className="flex flex-1 min-h-0 divide-x divide-zinc-800">
        {/* Left: ingest form */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-r border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">New Ticket</p>
          </div>
          <div className="p-4 flex flex-col gap-3 flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste support ticket text…"
              rows={8}
              className="w-full resize-none bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-zinc-200 placeholder-zinc-600 font-mono focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors"
            />
            <button
              onClick={() => text.trim() && mutation.mutate(text.trim())}
              disabled={!text.trim() || mutation.isPending}
              className="w-full py-2 px-4 bg-zinc-100 text-zinc-900 text-sm font-semibold rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
            >
              {mutation.isPending ? 'Processing…' : 'Ingest →'}
            </button>
            {mutation.isError && (
              <p className="text-xs text-red-400 font-mono">
                {(mutation.error as Error).message}
              </p>
            )}
          </div>
        </div>

        {/* Right: decision list + trace */}
        <div className="flex flex-1 min-w-0 divide-x divide-zinc-800">
          {/* Decision list */}
          <div className="flex flex-col min-w-0 flex-1 md:max-w-sm lg:max-w-md xl:max-w-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Decisions</p>
              {decisionsLoading && (
                <span className="text-xs text-zinc-600 font-mono">loading…</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {decisions.length === 0 && !decisionsLoading ? (
                <p className="text-xs text-zinc-600 px-4 py-6 font-mono">No decisions yet.</p>
              ) : (
                decisions.map((d) => (
                  <DecisionRow
                    key={d.id}
                    decision={d}
                    selected={d.id === selectedId}
                    onClick={() => setSelectedId(d.id === selectedId ? null : d.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Trace panel */}
          {selectedDecision && (
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Trace</p>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
                >
                  ✕ close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PolicyTrace decision={selectedDecision} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DecisionRow({
  decision,
  selected,
  onClick,
}: {
  decision: Decision
  selected: boolean
  onClick: () => void
}) {
  const ts = new Date(decision.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 border-b border-zinc-800/60 hover:bg-zinc-900/60 transition-colors flex flex-col gap-1 ${
        selected ? 'bg-zinc-900 border-l-2 border-l-zinc-400' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-zinc-500 shrink-0">{ts}</span>
        <span className="font-mono text-xs text-zinc-500 shrink-0">{decision.latency_ms}ms</span>
      </div>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs text-zinc-300 truncate">{decision.belief_state?.topic ?? '—'}</span>
        <ActionChip action={decision.action} />
      </div>
    </button>
  )
}
