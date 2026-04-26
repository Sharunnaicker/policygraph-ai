export type UrgencyLevel = 'low' | 'medium' | 'high'
export type CustomerTier = 'free' | 'pro' | 'enterprise'
export type ActionType =
  | 'ASK_CLARIFYING_QUESTION'
  | 'RETRIEVE_DOCS'
  | 'ESCALATE_TO_HUMAN'
  | 'UPGRADE_MODEL'
  | 'TRIGGER_WORKFLOW'

export interface BeliefState {
  urgency: UrgencyLevel
  customer_tier: CustomerTier
  confidence: number
  ambiguity: boolean
  missing_fields: string[]
  topic: string
}

export interface PolicyResult {
  action: ActionType
  reason: string
  triggered_rule: string
}

export interface Decision {
  id: string
  input_text: string
  belief_state: BeliefState
  action: ActionType
  reason: string
  triggered_rule: string
  latency_ms: number
  created_at: string
}

export interface IngestResponse {
  decision_id: string
  belief_state: BeliefState
  policy_result: PolicyResult
  latency_ms: number
}

export interface DecisionsResponse {
  decisions: Decision[]
  count: number
}

export interface BeliefResponse {
  decision_id: string
  belief_state: BeliefState
  source: 'cache' | 'db'
}
