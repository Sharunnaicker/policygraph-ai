import json
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.belief_extractor import extract_beliefs
from ..services.policy_engine import evaluate_policy
from ..db import postgres, redis_client

router = APIRouter()


class IngestRequest(BaseModel):
    text: str


class IngestResponse(BaseModel):
    decision_id: str
    belief_state: dict
    policy_result: dict
    latency_ms: int


@router.post("/ingest", response_model=IngestResponse)
async def ingest(body: IngestRequest):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    start = time.monotonic()

    beliefs = await extract_beliefs(body.text)
    result = evaluate_policy(beliefs)

    latency_ms = int((time.monotonic() - start) * 1000)

    belief_dict = beliefs.model_dump()
    # Serialize enums to their string values for JSON storage
    belief_dict["urgency"] = belief_dict["urgency"].value if hasattr(belief_dict["urgency"], "value") else belief_dict["urgency"]
    belief_dict["customer_tier"] = belief_dict["customer_tier"].value if hasattr(belief_dict["customer_tier"], "value") else belief_dict["customer_tier"]

    decision_id = await postgres.insert_decision(
        input_text=body.text,
        belief_state=belief_dict,
        action=result.action.value,
        reason=result.reason,
        triggered_rule=result.triggered_rule,
        latency_ms=latency_ms,
    )

    await redis_client.cache_belief(decision_id, belief_dict)

    return IngestResponse(
        decision_id=decision_id,
        belief_state=belief_dict,
        policy_result={
            "action": result.action.value,
            "reason": result.reason,
            "triggered_rule": result.triggered_rule,
        },
        latency_ms=latency_ms,
    )
