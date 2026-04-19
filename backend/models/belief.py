from enum import Enum
from pydantic import BaseModel, Field


class UrgencyLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class CustomerTier(str, Enum):
    free = "free"
    pro = "pro"
    enterprise = "enterprise"


class BeliefState(BaseModel):
    urgency: UrgencyLevel
    customer_tier: CustomerTier
    confidence: float = Field(ge=0.0, le=1.0)
    ambiguity: bool
    missing_fields: list[str]
    topic: str
