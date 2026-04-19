from fastapi import APIRouter, HTTPException
from ..db import postgres, redis_client

router = APIRouter()


@router.get("/beliefs/{decision_id}")
async def get_beliefs(decision_id: str):
    cached = await redis_client.get_cached_belief(decision_id)
    if cached:
        return {"decision_id": decision_id, "belief_state": cached, "source": "cache"}

    row = await postgres.fetch_decision_by_id(decision_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Decision not found")

    return {"decision_id": decision_id, "belief_state": row["belief_state"], "source": "db"}
