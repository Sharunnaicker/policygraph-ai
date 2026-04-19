from ..models.belief import BeliefState, UrgencyLevel, CustomerTier
from ..models.action import ActionType
from ..models.policy import PolicyResult


def evaluate_policy(beliefs: BeliefState) -> PolicyResult:
    if beliefs.confidence < 0.4 and len(beliefs.missing_fields) > 0:
        return PolicyResult(
            action=ActionType.ASK_CLARIFYING_QUESTION,
            reason=f"Low confidence ({beliefs.confidence:.2f}) with missing fields: {beliefs.missing_fields}",
            triggered_rule="low_confidence_with_missing_fields",
        )

    if beliefs.urgency == UrgencyLevel.high and beliefs.customer_tier == CustomerTier.enterprise:
        return PolicyResult(
            action=ActionType.ESCALATE_TO_HUMAN,
            reason=f"High urgency request from enterprise customer",
            triggered_rule="high_urgency_enterprise",
        )

    if beliefs.ambiguity:
        return PolicyResult(
            action=ActionType.RETRIEVE_DOCS,
            reason="Ambiguous request — surfacing documentation to clarify",
            triggered_rule="ambiguous_request",
        )

    if beliefs.urgency == UrgencyLevel.high and beliefs.confidence > 0.7:
        return PolicyResult(
            action=ActionType.TRIGGER_WORKFLOW,
            reason=f"High urgency with high confidence ({beliefs.confidence:.2f}) — triggering automated workflow",
            triggered_rule="high_urgency_high_confidence",
        )

    return PolicyResult(
        action=ActionType.RETRIEVE_DOCS,
        reason="No specific rule matched — defaulting to documentation retrieval",
        triggered_rule="default",
    )
