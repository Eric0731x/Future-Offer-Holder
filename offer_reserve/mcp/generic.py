"""通用 MCP / REST 抓取兜底。

接入约定（REST 模式）：
- GET {server_url}?keyword=...&limit=...&type=jd|internship
- Header: Authorization: Bearer {credential}
- 返回 JSON：{"items": [{company, position, jd_text, url, location}]}

不实现页面爬取（合规：只读、不模拟登录）。
"""

from __future__ import annotations

import httpx

from offer_reserve.mcp.base import JDItem, SourceConfig


class GenericSource:
    def __init__(self, cfg: SourceConfig) -> None:
        self.cfg = cfg

    async def fetch_jds(self, keyword: str, *, limit: int = 50) -> list[JDItem]:
        return await self._fetch(keyword, limit, "jd")

    async def fetch_internships(self, keyword: str, *, limit: int = 20) -> list[JDItem]:
        return await self._fetch(keyword, limit, "internship")

    async def _fetch(self, keyword: str, limit: int, type_: str) -> list[JDItem]:
        if not self.cfg.server_url:
            return []
        headers = {}
        if self.cfg.credential:
            headers["Authorization"] = f"Bearer {self.cfg.credential}"
        async with httpx.AsyncClient(timeout=60.0) as http:
            resp = await http.get(
                self.cfg.server_url,
                params={"keyword": keyword, "limit": limit, "type": type_},
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
        items = data.get("items", []) if isinstance(data, dict) else []
        return [
            JDItem(
                company=str(i.get("company", "")),
                position=str(i.get("position", "")),
                jd_text=str(i.get("jd_text", "")),
                source=self.cfg.name,
                url=str(i.get("url", "")),
                location=str(i.get("location", "")),
                snippet=str(i.get("snippet", "")),
            )
            for i in items
        ]
