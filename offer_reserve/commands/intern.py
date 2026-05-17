"""指令：`实习` — 查看匹配度 Top 5 的实习。"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.messaging import action_row, button, card, divider, md

logger = logging.getLogger(__name__)


async def handle(user_open_id: str, arg: str) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        return {"ok": False, "msg": "请先完成用户档案登记"}

    filter_ = (
        f'AND(CurrentValue.[关联用户]="{user["record_id"]}",'
        f'CurrentValue.[用户操作]="未查看")'
    )
    items = await bt.list_records(bt.table("internship_match"), filter_=filter_)
    items.sort(key=lambda r: r["fields"].get("匹配度", 0), reverse=True)
    items = items[:5]
    if not items:
        return {"ok": True, "msg": "暂无匹配实习。系统会定时为你抓取，请稍后再来。"}

    elements: list[dict] = []
    for r in items:
        f = r["fields"]
        elements.append(
            md(
                f"**{f.get('公司','')} · {f.get('岗位','')}**　匹配度 {f.get('匹配度',0)}\n"
                f"📍 {f.get('地点','—')}\n"
                f"{(f.get('JD 摘要') or '')[:120]}\n"
                f"理由：{(f.get('推荐理由') or '')[:80]}"
            )
        )
        elements.append(
            action_row(
                button("查看", url=f.get("来源链接") or None, type_="primary"),
                button(
                    "已忽略",
                    value={"action": "intern_ignore", "record_id": r["record_id"]},
                    type_="default",
                ),
            )
        )
        elements.append(divider())

    return {
        "ok": True,
        "data": {"count": len(items)},
        "card": card("💼 匹配实习（Top 5）", elements[:-1]),
    }
