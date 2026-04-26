import json
import os
import anthropic
from ..models.belief import BeliefState

_SYSTEM_PROMPT = """You are a belief extractor for a customer support AI system.
Extract structured beliefs from the incoming support ticket text.
Return ONLY a valid JSON object with these exact fields:
- urgency: "low" | "medium" | "high"
- customer_tier: "free" | "pro" | "enterprise"
- confidence: float between 0.0 and 1.0 (how confident you are in your extraction)
- ambiguity: boolean (true if the request is unclear or could mean multiple things)
- missing_fields: array of strings (information that would help resolve this ticket, e.g. ["order_id", "account_email"])
- topic: string (brief category of the issue, e.g. "billing", "technical_error", "feature_request")

If customer tier is not mentioned, default to "free".
If urgency is not clear, use "medium".
"""

_MOCK_BELIEFS = BeliefState(
    urgency="medium",
    customer_tier="free",
    confidence=0.5,
    ambiguity=True,
    missing_fields=[],
    topic="unknown",
)


async def extract_beliefs(text: str) -> BeliefState:
    if not os.getenv("ANTHROPIC_API_KEY"):
        return _MOCK_BELIEFS

    client = anthropic.Anthropic()
    message = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
        max_tokens=512,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": text}],
    )

    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw)
    return BeliefState(**data)
