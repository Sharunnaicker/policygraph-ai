from dataclasses import dataclass
from .action import ActionType


@dataclass
class PolicyResult:
    action: ActionType
    reason: str
    triggered_rule: str
