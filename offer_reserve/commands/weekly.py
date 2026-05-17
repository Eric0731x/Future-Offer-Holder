"""指令：`本周` — 看本周应推进的 P0/P1 KR。"""

from __future__ import annotations

from datetime import datetime, timedelta

from offer_reserve.ai import prompts
from offer_reserve.ai.router import get_router
from offer_reserve.config import get_settings
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.messaging import action_row, button, card, divider, md


async def handle(user_open_id: str, arg: str) -> dict:
    bt = BitableClient()
    settings = get_settings()

    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        return {"ok": False, "msg": "请先完成用户档案登记"}

    okr = await bt.list_current_okr(user["record_id"])
    if not okr:
        return {"ok": False, "msg": "尚未锚定方向。请先发送：锚定 <方向>"}

    krs = await bt.list_krs_of_okr(okr["record_id"])
    semester = _current_semester(user["fields"])
    candidates = [
        r for r in krs
        if r.get("fields", {}).get("优先级") in {"P0", "P1"}
        and r.get("fields", {}).get("状态") not in {"已完成", "已暂停"}
        and (not semester or r.get("fields", {}).get("所属学期") == semester)
    ]
    candidates.sort(key=lambda r: r["fields"].get("优先级", "P2"))

    if not candidates:
        return {
            "ok": True,
            "msg": "本周没有 P0/P1 KR 需要推进 — 可以考虑拓展 P2 或主动暴露卡点。",
        }

    kr_summary = "\n".join(
        f"- [{r['fields'].get('优先级')}] {r['fields'].get('KR 内容')}（完成度 {r['fields'].get('完成度', 0)}%）"
        for r in candidates[:10]
    )
    advice = ""
    try:
        rendered = prompts.render(
            "weekly",
            objective=okr["fields"].get("Objective", ""),
            krs=kr_summary,
        )
        advice = await get_router().call(rendered, task_type="本周")
    except Exception:
        advice = ""

    actions = []
    for r in candidates[:5]:
        kr_id = r["record_id"]
        url = f"{settings.web_public_url}/checkin?kr={kr_id}&user={user_open_id}"
        kr_name = r["fields"].get("KR 内容", "")[:12]
        actions.append(button(f"打卡：{kr_name}", url=url))

    elements = [md(f"**本周 P0/P1 KR**\n{kr_summary}")]
    if advice:
        elements += [divider(), md(advice)]
    if actions:
        elements += [divider(), action_row(*actions)]

    return {
        "ok": True,
        "data": {"count": len(candidates)},
        "card": card("📅 本周任务", elements),
    }


def _current_semester(uf: dict) -> str:
    """根据入学年份 + 当前日期推算所处学期（粗略）。"""
    grade = uf.get("年级") or ""
    if not grade:
        return ""
    month = datetime.utcnow().month
    half = "上" if month >= 9 or month <= 1 else "下"
    base = grade[:2]  # 取"大一 / 大二 / 研一" 前两个字
    return f"{base}{half}"
