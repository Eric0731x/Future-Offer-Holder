"""飞书 OpenAPI 基础客户端。

只封装鉴权 + 通用 HTTP 调用，业务逻辑见 bitable / docs / messaging。
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

import httpx

from offer_reserve.config import get_settings

logger = logging.getLogger(__name__)

OPEN_API_BASE = "https://open.feishu.cn/open-apis"


class LarkAuthError(RuntimeError):
    pass


class LarkAPIError(RuntimeError):
    def __init__(self, code: int, msg: str, payload: Any = None) -> None:
        super().__init__(f"[{code}] {msg}")
        self.code = code
        self.msg = msg
        self.payload = payload


class LarkClient:
    """异步飞书客户端。

    内部维护 tenant_access_token，过期前自动刷新。
    """

    def __init__(self, app_id: Optional[str] = None, app_secret: Optional[str] = None) -> None:
        settings = get_settings()
        self.app_id = app_id or settings.feishu_app_id
        self.app_secret = app_secret or settings.feishu_app_secret
        self._token: Optional[str] = None
        self._token_expire_at: float = 0.0
        self._lock = asyncio.Lock()
        self._http = httpx.AsyncClient(timeout=30.0, base_url=OPEN_API_BASE)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def _refresh_token(self) -> None:
        if not self.app_id or not self.app_secret:
            raise LarkAuthError("FEISHU_APP_ID / FEISHU_APP_SECRET 未配置")
        resp = await self._http.post(
            "/auth/v3/tenant_access_token/internal",
            json={"app_id": self.app_id, "app_secret": self.app_secret},
        )
        data = resp.json()
        if data.get("code") != 0:
            raise LarkAuthError(f"获取 tenant_access_token 失败: {data}")
        self._token = data["tenant_access_token"]
        # 提前 5 分钟过期
        self._token_expire_at = time.time() + max(60, data.get("expire", 7200) - 300)

    async def token(self) -> str:
        async with self._lock:
            if not self._token or time.time() >= self._token_expire_at:
                await self._refresh_token()
            assert self._token
            return self._token

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[dict] = None,
        json: Optional[dict] = None,
        files: Optional[dict] = None,
    ) -> dict:
        token = await self.token()
        headers = {"Authorization": f"Bearer {token}"}
        last_exc: Optional[Exception] = None
        for attempt in range(3):
            try:
                resp = await self._http.request(
                    method,
                    path,
                    params=params,
                    json=json,
                    files=files,
                    headers=headers,
                )
                data = resp.json() if resp.content else {}
                if data.get("code", 0) == 0:
                    return data
                # token 过期，强制刷新
                if data.get("code") in (99991663, 99991661):
                    self._token = None
                    token = await self.token()
                    headers["Authorization"] = f"Bearer {token}"
                    continue
                raise LarkAPIError(data.get("code", -1), data.get("msg", "unknown"), data)
            except (httpx.HTTPError,) as exc:
                last_exc = exc
                await asyncio.sleep(2 ** attempt)
        if last_exc:
            raise last_exc
        raise LarkAPIError(-1, "请求失败且无异常")


_global_client: Optional[LarkClient] = None


def get_client() -> LarkClient:
    global _global_client
    if _global_client is None:
        _global_client = LarkClient()
    return _global_client
