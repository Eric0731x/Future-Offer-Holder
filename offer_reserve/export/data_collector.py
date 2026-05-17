"""聚合 T4/T5/T6/T8 数据，作为报告渲染输入。"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Literal

from offer_reserve.lark.bitable import BitableClient

Period = Literal["weekly", "monthly", "semester", "overall"]


WINDOW_DAYS = {"weekly": 7, "monthly": 30, "semester": 150, "overall": 1825}


async def collect_report_data(user_open_id: str, period: Period) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        raise ValueError("用户未注册")
    okr = await bt.list_current_okr(user["record_id"])
    krs = await bt.list_krs_of_okr(okr["record_id"]) if okr else []

    days = WINDOW_DAYS[period]
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    logs = await bt.list_logs_in_range(
        user["record_id"], int(start.timestamp() * 1000), int(end.timestamp() * 1000)
    )

    advice_filter = (
        f'AND(CurrentValue.[用户 ID]="{user["record_id"]}",'
        f'CurrentValue.[生成日期]>={int(start.timestamp() * 1000)})'
    )
    advice = await bt.list_records(bt.table("ai_advice"), filter_=advice_filter)

    total_hours = sum(float(l["fields"].get("投入时长") or 0) for l in logs)
    overall_progress = (
        sum(int(k["fields"].get("完成度") or 0) for k in krs) / len(krs) if krs else 0
    )

    return {
        "period": period,
        "period_label": _period_label(period, start, end),
        "user": user["fields"],
        "okr": okr["fields"] if okr else {},
        "krs": [k["fields"] | {"_id": k["record_id"]} for k in krs],
        "logs": [l["fields"] | {"_id": l["record_id"]} for l in logs],
        "advice": [a["fields"] | {"_id": a["record_id"]} for a in advice],
        "stats": {
            "total_hours": round(total_hours, 1),
            "log_count": len(logs),
            "overall_progress": round(overall_progress, 1),
            "kr_count": len(krs),
            "completed_kr": sum(1 for k in krs if int(k["fields"].get("完成度") or 0) >= 100),
        },
        "generated_at": end.strftime("%Y-%m-%d %H:%M"),
    }


def _period_label(period: Period, start: datetime, end: datetime) -> str:
    if period == "weekly":
        return f"周报 {start.strftime('%Y-%m-%d')} → {end.strftime('%Y-%m-%d')}"
    if period == "monthly":
        return f"月报 {end.strftime('%Y-%m')}"
    if period == "semester":
        return f"学期报 {start.strftime('%Y-%m')} → {end.strftime('%Y-%m')}"
    return f"总报告 截至 {end.strftime('%Y-%m-%d')}"
