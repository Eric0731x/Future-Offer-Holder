"""OpenAI Chat Completions 兼容协议。

兼容 OpenAI / 豆包 / 通义 / DeepSeek / 智谱等多数厂商。
"""

from __future__ import annotations

from typing import Optional

import httpx

from offer_reserve.ai.providers.base import ProviderConfig


class OpenAICompatProvider:
    def __init__(self, cfg: ProviderConfig) -> None:
        self.cfg = cfg

    async def chat(self, prompt: str, *, system: Optional[str] = None) -> str:
        messages: list[dict] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        payload = {
            "model": self.cfg.model,
            "messages": messages,
            "temperature": self.cfg.temperature,
            "max_tokens": self.cfg.max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self.cfg.api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(self.cfg.endpoint, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise RuntimeError(f"OpenAI 兼容响应解析失败: {data}") from exc
