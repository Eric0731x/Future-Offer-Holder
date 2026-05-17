"""飞书 Bot 主入口（事件回调）。

只暴露一个 HTTP 端点 `/lark/event`：
- 处理飞书 URL Verification challenge
- 处理 im.message.receive_v1 事件 → 路由到 commands.dispatch
- 处理 card.action.trigger（交互按钮）→ 简单回执

约束：不内置任何业务逻辑，所有命令实现都在 commands/。
"""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Request

from offer_reserve.commands import dispatch
from offer_reserve.lark.messaging import Messenger

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/lark", tags=["lark"])


@router.post("/event")
async def event(request: Request) -> dict:
    body: dict[str, Any] = await request.json()

    # URL verification
    if body.get("type") == "url_verification":
        return {"challenge": body.get("challenge", "")}

    schema = body.get("schema")
    header = body.get("header", {})
    event_type = header.get("event_type") or body.get("event", {}).get("type", "")

    if event_type == "im.message.receive_v1":
        await _handle_message(body)
    elif event_type == "card.action.trigger":
        await _handle_card_action(body)
    else:
        logger.debug("忽略事件：%s", event_type)
    return {"code": 0}


async def _handle_message(body: dict) -> None:
    event = body.get("event", {})
    message = event.get("message", {}) or {}
    sender = event.get("sender", {}) or {}
    open_id = sender.get("sender_id", {}).get("open_id") or message.get("chat_id")
    msg_id = message.get("message_id")
    content_raw = message.get("content", "{}")
    try:
        content = json.loads(content_raw)
    except json.JSONDecodeError:
        content = {}
    text = content.get("text", "")

    if not open_id or not text:
        return
    result = await dispatch(open_id, text)
    msg = Messenger()
    if result.get("card"):
        await msg.reply_card(msg_id, result["card"])
    elif result.get("msg"):
        await msg.reply_text(msg_id, result["msg"])
    else:
        await msg.reply_text(msg_id, "✅ 已处理")


async def _handle_card_action(body: dict) -> None:
    event = body.get("event", {})
    action = event.get("action", {}) or {}
    value = action.get("value") or {}
    logger.info("Card action: %s", value)
    # 简化处理：根据 action 字段做轻量副作用，例如 intern_ignore
    if value.get("action") == "intern_ignore":
        from offer_reserve.lark.bitable import BitableClient

        bt = BitableClient()
        record_id = value.get("record_id")
        if record_id:
            try:
                await bt.update_record(bt.table("internship_match"), record_id, {"用户操作": "已忽略"})
            except Exception as exc:
                logger.warning("忽略实习失败：%s", exc)
