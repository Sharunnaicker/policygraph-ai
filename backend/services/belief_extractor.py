import json
import anthropic
from ..models.belief import BeliefState

_client = anthropic.Anthropic()

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


async def extract_beliefs(text: str) -> BeliefState:
    message = _client.messages.create(
        model="claude-sonnet-4-6",
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
