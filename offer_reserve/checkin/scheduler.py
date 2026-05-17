"""定时任务调度器。

任务：
- 每日 21:00 — 给"每日打卡"模式的用户私聊提醒
- 每周日 22:00 — 为每位活跃用户的每条 P0/P1 KR 生成"周建议"
- 每月最后一天 22:00 — 月建议
- 每日 02:00 — MCP 抓取（按 T10 频率过滤）
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from offer_reserve.checkin.advice_generator import generate_advice
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.messaging import Messenger
from offer_reserve.mcp.registry import get_registry

logger = logging.getLogger(__name__)


def build_scheduler() -> AsyncIOScheduler:
    sched = AsyncIOScheduler(timezone="Asia/Shanghai")
    sched.add_job(daily_checkin_reminder, CronTrigger(hour=21, minute=0), id="daily_reminder")
    sched.add_job(weekly_advice_job, CronTrigger(day_of_week="sun", hour=22, minute=0), id="weekly_advice")
    sched.add_job(monthly_advice_job, CronTrigger(day="last", hour=22, minute=0), id="monthly_advice")
    sched.add_job(mcp_pull_job, CronTrigger(hour=2, minute=0), id="mcp_pull")
    return sched


# ----------------------------------------------------------------------------
# Jobs
# ----------------------------------------------------------------------------

async def daily_checkin_reminder() -> None:
    bt = BitableClient()
    msg = Messenger()
    users = await bt.list_records(
        bt.table("user_profile"),
        filter_='CurrentValue.[打卡频率偏好]="每日打卡"',
    )
    for u in users:
        open_id = u["fields"].get("用户 ID")
        if not open_id:
            continue
        try:
            await msg.send_text(
                open_id,
                "📌 今日打卡提醒：花 3 分钟记一下今天对 KR 的推进，AI 建议会即时生成。",
            )
        except Exception as exc:
            logger.warning("发送提醒失败 %s：%s", open_id, exc)


async def weekly_advice_job() -> None:
    await _aggregate_advice_for_all(window_days=7, advice_type="周建议")


async def monthly_advice_job() -> None:
    await _aggregate_advice_for_all(window_days=30, advice_type="月建议")


async def _aggregate_advice_for_all(*, window_days: int, advice_type: str) -> None:
    bt = BitableClient()
    users = await bt.list_records(bt.table("user_profile"))
    end = datetime.utcnow()
    start = end - timedelta(days=window_days)
    start_ms = int(start.timestamp() * 1000)
    end_ms = int(end.timestamp() * 1000)
    for u in users:
        try:
            okr = await bt.list_current_okr(u["record_id"])
            if not okr:
                continue
            logs = await bt.list_logs_in_range(u["record_id"], start_ms, end_ms)
            if not logs:
                continue
            # 按 KR 分桶
            buckets: dict[str, list[dict]] = {}
            for log in logs:
                kr_ref = log["fields"].get("关联 KR") or []
                if isinstance(kr_ref, list) and kr_ref:
                    buckets.setdefault(kr_ref[0], []).append(log)
            for kr_id, kr_logs in buckets.items():
                sample = _summarise_logs(kr_logs)
                try:
                    await generate_advice(
                        u["record_id"], kr_id, advice_type, sample_text=sample, bt=bt
                    )
                    await asyncio.sleep(0.5)
                except Exception as exc:
                    logger.warning("%s 生成 %s 失败：%s", u["record_id"], advice_type, exc)
        except Exception as exc:
            logger.exception("用户聚合建议失败 %s：%s", u.get("record_id"), exc)


def _summarise_logs(logs: list[dict]) -> str:
    parts = [f"共 {len(logs)} 条日志，累计投入 {sum(float(l['fields'].get('投入时长') or 0) for l in logs):.1f} 小时"]
    for l in logs[:10]:
        f = l["fields"]
        parts.append(f"- {f.get('今日做了什么','')[:80]}（学到：{f.get('学到了什么','')[:60]}）")
    return "\n".join(parts)


async def mcp_pull_job() -> None:
    """按 T10 配置批量抓取。这里只触发 reload 让 registry 自检；
    实际抓取由 锚定 指令或外部 MCP 网关按需触发。"""
    try:
        await get_registry().reload()
    except Exception as exc:
        logger.warning("MCP reload 失败：%s", exc)
