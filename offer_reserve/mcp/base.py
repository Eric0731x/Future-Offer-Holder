"""MCP 数据源公共接口。

约束：
- **只读**：不模拟登录、不写入第三方平台
- 单平台 QPS ≤ 1
- 抓取失败重试 3 次，仍失败则跳过并写入告警
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Protocol


@dataclass
class JDItem:
    company: str
    position: str
    jd_text: str
    source: str
    url: str = ""
    location: str = ""
    snippet: str = ""


@dataclass
class SourceConfig:
    source_id: str
    name: str
    access_type: str  # MCP协议 / REST API / 网页爬取
    server_url: str
    credential: str = ""
    enabled: bool = True
    scope_fields: list[str] = field(default_factory=list)  # 关联的 T2 方向名


class MCPSource(Protocol):
    cfg: SourceConfig

    async def fetch_jds(self, keyword: str, *, limit: int = 50) -> list[JDItem]:
        ...

    async def fetch_internships(self, keyword: str, *, limit: int = 20) -> list[JDItem]:
        ...
