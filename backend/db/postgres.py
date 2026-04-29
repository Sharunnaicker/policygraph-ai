import os
import json
import asyncpg

_pool: asyncpg.Pool | None = None

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS decisions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_text  TEXT NOT NULL,
    belief_state JSONB NOT NULL,
    action      TEXT NOT NULL,
    reason      TEXT NOT NULL,
    triggered_rule TEXT NOT NULL,
    latency_ms  INTEGER NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
"""


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(dsn=os.environ["DATABASE_URL"], min_size=2, max_size=10)
        async with _pool.acquire() as conn:
            await conn.execute(CREATE_TABLE_SQL)
    return _pool


async def insert_decision(
    input_text: str,
    belief_state: dict,
    action: str,
    reason: str,
    triggered_rule: str,
    latency_ms: int,
) -> str:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO decisions (input_text, belief_state, action, reason, triggered_rule, latency_ms)
            VALUES ($1, $2::jsonb, $3, $4, $5, $6)
            RETURNING id::text
            """,
            input_text,
            json.dumps(belief_state),
            action,
            reason,
            triggered_rule,
            latency_ms,
        )
        return row["id"]


async def fetch_decisions(limit: int = 50) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id::text, input_text, belief_state, action, reason, triggered_rule, latency_ms, created_at "
            "FROM decisions ORDER BY created_at DESC LIMIT $1",
            limit,
        )
        result = []
        for r in rows:
            row = dict(r)
            if isinstance(row.get("belief_state"), str):
                row["belief_state"] = json.loads(row["belief_state"])
            result.append(row)
        return result


async def fetch_decision_by_id(decision_id: str) -> dict | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id::text, input_text, belief_state, action, reason, triggered_rule, latency_ms, created_at "
            "FROM decisions WHERE id = $1::uuid",
            decision_id,
        )
        if row is None:
            return None
        result = dict(row)
        if isinstance(result.get("belief_state"), str):
            result["belief_state"] = json.loads(result["belief_state"])
        return result
