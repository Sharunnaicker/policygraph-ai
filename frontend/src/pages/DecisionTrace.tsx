import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDecisionById } from '../api/client'
import PolicyTrace from '../components/PolicyTrace'

export default function DecisionTrace() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => getDecisionById(id!),
    enabled: !!id,
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3">
        <Link
          to="/"
          className="text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors"
        >
          ← Dashboard
        </Link>
        <span className="text-zinc-700 text-xs">/</span>
        <span className="font-mono text-xs text-zinc-400">
          decisions/<span className="text-zinc-200">{id}</span>
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {isLoading && (
          <p className="text-zinc-500 font-mono text-sm">Loading decision…</p>
        )}
        {isError && (
          <p className="text-red-400 font-mono text-sm">
            Error: {(error as Error).message}
          </p>
        )}
        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-mono text-zinc-300">Decision Trace</h1>
              <span className="text-xs font-mono text-zinc-500">
                {new Date(data.created_at).toLocaleString()}
              </span>
            </div>
            <PolicyTrace decision={data} />
          </div>
        )}
      </div>
    </div>
  )
}
