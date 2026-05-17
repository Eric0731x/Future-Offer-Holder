"""飞书消息卡片封装。

业务侧只构造"内容"，卡片样式由本模块统一生成。
"""

from __future__ import annotations

import json
from typing import Any, Optional

from offer_reserve.config import get_settings
from offer_reserve.lark.client import LarkClient, get_client


class Messenger:
    def __init__(self, client: Optional[LarkClient] = None) -> None:
        self.client = client or get_client()
        self.settings = get_settings()

    async def send_text(self, receive_id: str, text: str, receive_id_type: str = "open_id") -> dict:
        return await self._send(receive_id, "text", {"text": text}, receive_id_type)

    async def send_card(self, receive_id: str, card: dict, receive_id_type: str = "open_id") -> dict:
        return await self._send(receive_id, "interactive", card, receive_id_type)

    async def reply_text(self, message_id: str, text: str) -> dict:
        data = await self.client.request(
            "POST",
            f"/im/v1/messages/{message_id}/reply",
            json={"msg_type": "text", "content": json.dumps({"text": text}, ensure_ascii=False)},
        )
        return data.get("data", {})

    async def reply_card(self, message_id: str, card: dict) -> dict:
        data = await self.client.request(
            "POST",
            f"/im/v1/messages/{message_id}/reply",
            json={
                "msg_type": "interactive",
                "content": json.dumps(card, ensure_ascii=False),
            },
        )
        return data.get("data", {})

    async def _send(
        self, receive_id: str, msg_type: str, content: Any, receive_id_type: str
    ) -> dict:
        data = await self.client.request(
            "POST",
            "/im/v1/messages",
            params={"receive_id_type": receive_id_type},
            json={
                "receive_id": receive_id,
                "msg_type": msg_type,
                "content": json.dumps(content, ensure_ascii=False),
            },
        )
        return data.get("data", {})


# ----------------------------------------------------------------------------
# 卡片构造工具
# ----------------------------------------------------------------------------

def card(
    title: str,
    elements: list[dict],
    *,
    template: str = "blue",
) -> dict:
    return {
        "config": {"wide_screen_mode": True},
        "header": {
            "template": template,
            "title": {"tag": "plain_text", "content": title},
        },
        "elements": elements,
    }


def md(text: str) -> dict:
    return {"tag": "markdown", "content": text}


def button(text: str, url: Optional[str] = None, value: Optional[dict] = None,
           type_: str = "primary") -> dict:
    btn: dict[str, Any] = {
        "tag": "button",
        "text": {"tag": "plain_text", "content": text},
        "type": type_,
    }
    if url:
        btn["url"] = url
    if value:
        btn["value"] = value
    return btn


def action_row(*buttons: dict) -> dict:
    return {"tag": "action", "actions": list(buttons)}


def divider() -> dict:
    return {"tag": "hr"}
