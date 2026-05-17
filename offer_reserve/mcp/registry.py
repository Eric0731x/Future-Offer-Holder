"""MCP 数据源注册器 — 从 T10 表加载配置 + 调度抓取。"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Optional

from offer_reserve.config import get_settings
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.mcp.base import JDItem, MCPSource, SourceConfig

logger = logging.getLogger(__name__)


def _parse(rec: dict) -> Optional[SourceConfig]:
    f = rec.get("fields", {})
    if not f.get("启用", False):
        return None
    return SourceConfig(
        source_id=str(rec.get("record_id", "")),
        name=str(f.get("平台名", "")),
        access_type=str(f.get("接入类型", "")),
        server_url=str(f.get("Server URL", "")),
        credential=str(f.get("认证凭证", "")),
        enabled=True,
        scope_fields=[str(x) for x in (f.get("抓取范围") or [])],
    )


def _build_source(cfg: SourceConfig) -> MCPSource:
    name = cfg.name.lower()
    # 延迟导入避免循环
    if "boss" in name:
        from offer_reserve.mcp.boss import BossSource
        return BossSource(cfg)
    if "实习僧" in cfg.name or "shixiseng" in name:
        from offer_reserve.mcp.shixiseng import ShixisengSource
        return ShixisengSource(cfg)
    if "牛客" in cfg.name or "nowcoder" in name:
        from offer_reserve.mcp.nowcoder import NowcoderSource
        return NowcoderSource(cfg)
    from offer_reserve.mcp.generic import GenericSource
    return GenericSource(cfg)


class MCPRegistry:
    """从 T10 加载启用的数据源，提供按方向抓取的统一入口。"""

    def __init__(self, bitable: Optional[BitableClient] = None) -> None:
        self.bitable = bitable or BitableClient()
        self.settings = get_settings()
        self._sources: list[MCPSource] = []
        self._loaded_at: float = 0.0
        self._lock = asyncio.Lock()

    async def reload(self) -> None:
        try:
            records = await self.bitable.list_records(self.bitable.table("mcp_source"))
        except Exception as exc:
            logger.warning("MCP 配置加载失败：%s", exc)
            return
        cfgs = [c for c in (_parse(r) for r in records) if c]
        self._sources = [_build_source(c) for c in cfgs]
        self._loaded_at = time.time()
        logger.info("MCP 数据源已加载：%d 个", len(self._sources))

    async def _ensure_loaded(self) -> None:
        async with self._lock:
            if (
                not self._sources
                or time.time() - self._loaded_at > self.settings.model_reload_interval
            ):
                await self.reload()

    async def fetch_jds(self, field_name: str, *, limit_per_source: int = 50) -> list[JDItem]:
        await self._ensure_loaded()
        sources = [s for s in self._sources if not s.cfg.scope_fields or field_name in s.cfg.scope_fields]
        if not sources:
            return []
        results: list[JDItem] = []
        for src in sources:
            try:
                items = await _with_retry(src.fetch_jds, field_name, limit=limit_per_source)
                results.extend(items)
                # QPS 限制：单平台之间间隔
                await asyncio.sleep(1.0)
            except Exception as exc:
                logger.warning("数据源 %s 抓取 JD 失败：%s", src.cfg.name, exc)
        return results

    async def fetch_internships(self, field_name: str, *, limit_per_source: int = 20) -> list[JDItem]:
        await self._ensure_loaded()
        sources = [s for s in self._sources if not s.cfg.scope_fields or field_name in s.cfg.scope_fields]
        results: list[JDItem] = []
        for src in sources:
            try:
                items = await _with_retry(src.fetch_internships, field_name, limit=limit_per_source)
                results.extend(items)
                await asyncio.sleep(1.0)
            except Exception as exc:
                logger.warning("数据源 %s 抓取实习失败：%s", src.cfg.name, exc)
        return results


async def _with_retry(func, *args, **kwargs):
    last_exc: Optional[Exception] = None
    for i in range(3):
        try:
            return await func(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            await asyncio.sleep(2 ** i)
    raise last_exc  # type: ignore[misc]


_registry: Optional[MCPRegistry] = None


def get_registry() -> MCPRegistry:
    global _registry
    if _registry is None:
        _registry = MCPRegistry()
    return _registry
