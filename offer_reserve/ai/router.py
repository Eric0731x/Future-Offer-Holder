"""模型路由层。

约束：
- 不内置任何模型，启动时从 T9 表加载；
- 配置热加载（默认 60s 间隔）；
- 失败自动降级（按 priority 升序遍历）；
- 不缓存最终回答。
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Optional

from offer_reserve.ai.providers import ModelProvider, ProviderConfig, build_provider
from offer_reserve.config import get_settings
from offer_reserve.lark.bitable import BitableClient

logger = logging.getLogger(__name__)


VALID_TASK_TYPES = {"锚定", "拆解", "本周", "路径", "实习", "建议"}


def _normalize_applicable(raw) -> list[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw]
    if isinstance(raw, str):
        return [p.strip() for p in raw.split(",") if p.strip()]
    return []


def _parse_config(rec: dict) -> Optional[ProviderConfig]:
    f = rec.get("fields", {})
    if not f.get("启用", False):
        return None
    if not (f.get("API Key") and f.get("Endpoint URL") and f.get("模型标识")):
        return None
    return ProviderConfig(
        config_id=str(rec.get("record_id", "")),
        alias=str(f.get("模型别名", "")),
        vendor=str(f.get("厂商", "")),
        api_key=str(f.get("API Key", "")),
        endpoint=str(f.get("Endpoint URL", "")),
        model=str(f.get("模型标识", "")),
        protocol=str(f.get("协议类型", "OpenAI兼容")),
        max_tokens=int(f.get("最大 Token") or 2048),
        temperature=float(f.get("温度") or 0.4),
        applicable=_normalize_applicable(f.get("适用指令")),
        priority=int(f.get("优先级") or 100),
        enabled=True,
        note=str(f.get("备注", "")),
    )


class ModelRouter:
    """从 T9 加载模型，并按 task_type + priority 选模型 + 失败降级调用。"""

    def __init__(self, bitable: Optional[BitableClient] = None) -> None:
        self.bitable = bitable or BitableClient()
        self.settings = get_settings()
        self._providers: list[ProviderConfig] = []
        self._loaded_at: float = 0.0
        self._lock = asyncio.Lock()

    async def reload(self) -> None:
        try:
            records = await self.bitable.list_records(self.bitable.table("model_config"))
        except Exception as exc:  # pragma: no cover - 网络异常
            logger.warning("模型配置加载失败：%s", exc)
            return
        cfgs = [c for c in (_parse_config(r) for r in records) if c]
        cfgs.sort(key=lambda c: c.priority)
        self._providers = cfgs
        self._loaded_at = time.time()
        logger.info("模型配置已加载：%d 条", len(cfgs))

    async def _ensure_loaded(self) -> None:
        async with self._lock:
            if (
                not self._providers
                or time.time() - self._loaded_at > self.settings.model_reload_interval
            ):
                await self.reload()

    async def call(self, prompt: str, task_type: str, *, system: Optional[str] = None) -> str:
        """按 task_type 自动选模型并调用，失败自动降级。"""
        if task_type not in VALID_TASK_TYPES:
            raise ValueError(f"非法 task_type: {task_type}")
        await self._ensure_loaded()
        candidates = [c for c in self._providers if c.is_applicable(task_type)]
        if not candidates:
            raise RuntimeError("没有可用的模型配置（请检查 T9 模型配置表）")
        last_exc: Optional[Exception] = None
        for cfg in candidates:
            provider: ModelProvider = build_provider(cfg)
            try:
                text = await provider.chat(prompt, system=system)
                # 异步更新最近调用 / 累计调用计数（best-effort）
                asyncio.create_task(self._touch_usage(cfg))
                return text
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                logger.warning("模型 %s 调用失败，降级：%s", cfg.alias, exc)
        raise RuntimeError(f"所有候选模型均失败：{last_exc}")

    async def _touch_usage(self, cfg: ProviderConfig) -> None:
        try:
            rec = await self.bitable.get_record(self.bitable.table("model_config"), cfg.config_id)
            current = int(rec.get("fields", {}).get("累计调用") or 0)
            from datetime import datetime

            await self.bitable.update_record(
                self.bitable.table("model_config"),
                cfg.config_id,
                {
                    "累计调用": current + 1,
                    "最近调用": int(datetime.utcnow().timestamp() * 1000),
                },
            )
        except Exception as exc:  # pragma: no cover
            logger.debug("更新调用计数失败：%s", exc)


_router: Optional[ModelRouter] = None


def get_router() -> ModelRouter:
    global _router
    if _router is None:
        _router = ModelRouter()
    return _router
