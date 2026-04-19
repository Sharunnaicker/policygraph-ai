import os
import json
import redis.asyncio as redis

_client: redis.Redis | None = None
BELIEF_TTL_SECONDS = 300


def get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)
    return _client


async def cache_belief(decision_id: str, belief_dict: dict) -> None:
    client = get_client()
    await client.setex(f"belief:{decision_id}", BELIEF_TTL_SECONDS, json.dumps(belief_dict))


async def get_cached_belief(decision_id: str) -> dict | None:
    client = get_client()
    raw = await client.get(f"belief:{decision_id}")
    return json.loads(raw) if raw else None
