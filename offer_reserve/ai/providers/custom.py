"""自定义协议适配 — 通过统一约束的 JSON 直转。

约定：请求 body 为
  {"prompt": str, "system": str, "model": str, "max_tokens": int, "temperature": float}
响应：
  {"text": "..."} 或 OpenAI 风格 choices[0].message.content
"""

from __future__ import annotations

from typing import Optional

import httpx

from offer_reserve.ai.providers.base import ProviderConfig


class CustomProvider:
    def __init__(self, cfg: ProviderConfig) -> None:
        self.cfg = cfg

    async def chat(self, prompt: str, *, system: Optional[str] = None) -> str:
        payload = {
            "model": self.cfg.model,
            "prompt": prompt,
            "system": system or "",
            "max_tokens": self.cfg.max_tokens,
            "temperature": self.cfg.temperature,
        }
        headers = {
            "Authorization": f"Bearer {self.cfg.api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(self.cfg.endpoint, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        if isinstance(data, dict):
            if "text" in data:
                return data["text"]
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError):
                pass
        raise RuntimeError(f"自定义协议响应解析失败: {data}")
