from fastapi import APIRouter, HTTPException
from ..db import postgres, redis_client

router = APIRouter()


@router.get("/decisions")
async def list_decisions(limit: int = 50):
    rows = await postgres.fetch_decisions(limit=limit)
    for row in rows:
        if "created_at" in row and row["created_at"]:
            row["created_at"] = row["created_at"].isoformat()
    return {"decisions": rows, "count": len(rows)}


@router.get("/decisions/{decision_id}")
async def get_decision(decision_id: str):
    cached = await redis_client.get_cached_belief(decision_id)
    row = await postgres.fetch_decision_by_id(decision_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Decision not found")
    if "created_at" in row and row["created_at"]:
        row["created_at"] = row["created_at"].isoformat()
    if cached:
        row["belief_state"] = cached
    return row
