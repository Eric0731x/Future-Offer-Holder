"""Anthropic Messages API 协议。"""

from __future__ import annotations

from typing import Optional

import httpx

from offer_reserve.ai.providers.base import ProviderConfig


class AnthropicProvider:
    def __init__(self, cfg: ProviderConfig) -> None:
        self.cfg = cfg

    async def chat(self, prompt: str, *, system: Optional[str] = None) -> str:
        payload: dict = {
            "model": self.cfg.model,
            "max_tokens": self.cfg.max_tokens,
            "temperature": self.cfg.temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            payload["system"] = system
        headers = {
            "x-api-key": self.cfg.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(self.cfg.endpoint, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        try:
            blocks = data["content"]
            return "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        except (KeyError, TypeError) as exc:
            raise RuntimeError(f"Anthropic 响应解析失败: {data}") from exc
