"""模型提供者抽象。"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Protocol


@dataclass
class ProviderConfig:
    config_id: str
    alias: str
    vendor: str
    api_key: str
    endpoint: str
    model: str
    protocol: str
    max_tokens: int = 2048
    temperature: float = 0.4
    applicable: list[str] = field(default_factory=list)  # 适用指令
    priority: int = 100
    enabled: bool = True
    note: str = ""

    def is_applicable(self, task_type: str) -> bool:
        if not self.applicable or "全部" in self.applicable:
            return True
        return task_type in self.applicable


class ModelProvider(Protocol):
    cfg: ProviderConfig

    async def chat(self, prompt: str, *, system: Optional[str] = None) -> str:
        ...
