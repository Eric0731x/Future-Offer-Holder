"""六个核心指令实现 + 指令分发。"""

from __future__ import annotations

import logging
from typing import Awaitable, Callable

from offer_reserve.commands import anchor, decompose, export, intern, path, weekly

logger = logging.getLogger(__name__)


CommandHandler = Callable[[str, str], Awaitable[dict]]


# 六个指令（仅 6 个，不增不减）
HANDLERS: dict[str, CommandHandler] = {
    "锚定": anchor.handle,
    "拆解": decompose.handle,
    "本周": weekly.handle,
    "路径": path.handle,
    "实习": intern.handle,
    "导出": export.handle,
}


def parse(text: str) -> tuple[str, str]:
    """解析消息文本，返回 (指令名, 参数)。无法识别返回 ("", "")。"""
    text = (text or "").strip()
    if not text:
        return "", ""
    parts = text.split(None, 1)
    cmd = parts[0]
    arg = parts[1] if len(parts) > 1 else ""
    if cmd in HANDLERS:
        return cmd, arg
    return "", text


async def dispatch(user_open_id: str, text: str) -> dict:
    """业务编排层入口：解析 → 调用对应 handler。"""
    cmd, arg = parse(text)
    if not cmd:
        return {"ok": False, "msg": "未识别的指令。可用：锚定 / 拆解 / 本周 / 路径 / 实习 / 导出"}
    handler = HANDLERS[cmd]
    try:
        return await handler(user_open_id, arg)
    except Exception as exc:
        logger.exception("指令 %s 执行失败", cmd)
        return {"ok": False, "msg": f"指令 [{cmd}] 执行失败：{exc}"}
