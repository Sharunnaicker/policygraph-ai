import type {
  IngestResponse,
  DecisionsResponse,
  BeliefResponse,
  Decision,
} from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status}: ${detail}`)
  }
  return res.json() as Promise<T>
}

export async function ingestText(text: string): Promise<IngestResponse> {
  return request<IngestResponse>('/ingest', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function getDecisions(): Promise<DecisionsResponse> {
  return request<DecisionsResponse>('/decisions')
}

export async function getDecisionById(id: string): Promise<Decision> {
  return request<Decision>(`/decisions/${id}`)
}

export async function getBeliefById(id: string): Promise<BeliefResponse> {
  return request<BeliefResponse>(`/beliefs/${id}`)
}
