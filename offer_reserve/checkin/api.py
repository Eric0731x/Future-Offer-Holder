"""学习日志 Web API（FastAPI 路由）。

Web 前端通过这些接口完成：
- 拉取用户当前 KR 列表（打卡选项）
- 提交打卡日志
- 更新 KR 完成度（100% 必须带证据）
- 拉取建议历史 / KR 看板数据
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from offer_reserve.checkin.advice_generator import generate_advice
from offer_reserve.lark.bitable import BitableClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["checkin"])


# ----------------------------------------------------------------------------
# Schemas
# ----------------------------------------------------------------------------

class CheckinPayload(BaseModel):
    user_open_id: str
    kr_record_id: str
    mode: str = Field(default="每日打卡")  # 每日打卡 / 每次学习后
    hours: float = Field(default=0, ge=0, le=24)
    did_today: str = ""
    learned: str = ""
    problem: str = ""
    evidence_url: Optional[str] = None
    self_score: int = Field(default=3, ge=1, le=5)
    mood: str = "顺利"

    @field_validator("mode")
    @classmethod
    def _validate_mode(cls, v: str) -> str:
        if v not in {"每日打卡", "每次学习后"}:
            raise ValueError("mode 必须是 每日打卡 或 每次学习后")
        return v


class KRProgressPayload(BaseModel):
    user_open_id: str
    kr_record_id: str
    progress: int = Field(ge=0, le=100)
    evidence_url: Optional[str] = None
    bottleneck: Optional[str] = None


# ----------------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------------

@router.get("/me/krs")
async def my_krs(user_open_id: str) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        raise HTTPException(404, "用户未注册")
    okr = await bt.list_current_okr(user["record_id"])
    if not okr:
        return {"okr": None, "krs": []}
    krs = await bt.list_krs_of_okr(okr["record_id"])
    return {
        "okr": {
            "id": okr["record_id"],
            "objective": okr["fields"].get("Objective", ""),
            "completion": okr["fields"].get("整体完成度"),
        },
        "krs": [
            {
                "id": k["record_id"],
                "name": k["fields"].get("KR 内容", ""),
                "category": k["fields"].get("分类", ""),
                "priority": k["fields"].get("优先级", ""),
                "semester": k["fields"].get("所属学期", ""),
                "progress": k["fields"].get("完成度", 0),
                "status": k["fields"].get("状态", ""),
                "hours": k["fields"].get("投入小时数", 0),
                "advice_doc_url": k["fields"].get("建议文档 URL", ""),
                "path_doc_url": k["fields"].get("路径文档 URL", ""),
            }
            for k in krs
        ],
    }


@router.post("/checkin")
async def submit_checkin(payload: CheckinPayload) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(payload.user_open_id)
    if not user:
        raise HTTPException(404, "用户未注册")

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    fields = {
        "用户 ID": [user["record_id"]],
        "关联 KR": [payload.kr_record_id],
        "日志日期": now_ms,
        "打卡模式": payload.mode,
        "投入时长": payload.hours,
        "今日做了什么": payload.did_today,
        "学到了什么": payload.learned,
        "遇到的问题": payload.problem,
        "自评分": payload.self_score,
        "状态心情": payload.mood,
        "已处理": False,
    }
    if payload.evidence_url:
        fields["输出/证据"] = payload.evidence_url
    log = await bt.create_record(bt.table("learning_log"), fields)

    # 累加 KR 投入时长（best-effort）
    try:
        kr = await bt.get_record(bt.table("kr_progress"), payload.kr_record_id)
        prev = float(kr.get("fields", {}).get("投入小时数") or 0)
        await bt.update_record(
            bt.table("kr_progress"),
            payload.kr_record_id,
            {"投入小时数": prev + payload.hours, "最近更新": now_ms},
        )
    except Exception as exc:
        logger.warning("更新 KR 投入时长失败：%s", exc)

    # 触发日建议生成
    sample = (
        f"今日做了：{payload.did_today}\n"
        f"学到了：{payload.learned}\n"
        f"问题：{payload.problem}\n"
        f"投入时长：{payload.hours} 小时，自评 {payload.self_score} 分，心情 {payload.mood}"
    )
    advice = None
    try:
        advice = await generate_advice(
            user["record_id"],
            payload.kr_record_id,
            "日建议",
            sample_text=sample,
            bt=bt,
        )
        await bt.update_record(bt.table("learning_log"), log["record_id"], {"已处理": True})
    except Exception as exc:
        logger.warning("日建议生成失败：%s", exc)

    return {"ok": True, "log_id": log.get("record_id", ""), "advice": advice}


@router.post("/kr/progress")
async def update_kr_progress(payload: KRProgressPayload) -> dict:
    """更新 KR 完成度；100% 必须有证据。"""
    if payload.progress == 100 and not payload.evidence_url:
        raise HTTPException(400, "完成度 100 必须提供关联证据")
    bt = BitableClient()
    user = await bt.find_user_by_open_id(payload.user_open_id)
    if not user:
        raise HTTPException(404, "用户未注册")

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    fields: dict = {"完成度": payload.progress, "最近更新": now_ms}
    if payload.progress == 100:
        fields["状态"] = "已完成"
        fields["实际完成日"] = now_ms
        if payload.evidence_url:
            fields["关联证据"] = payload.evidence_url
    elif payload.progress > 0:
        fields["状态"] = "学习中"
    if payload.bottleneck:
        fields["卡点描述"] = payload.bottleneck

    await bt.update_record(bt.table("kr_progress"), payload.kr_record_id, fields)

    # 完成度更新触发建议刷新（KR 完成建议）
    advice = None
    if payload.progress == 100:
        try:
            sample = f"用户标记 KR 完成，证据：{payload.evidence_url or '(无)'}\n卡点：{payload.bottleneck or '(无)'}"
            advice = await generate_advice(
                user["record_id"], payload.kr_record_id, "KR 完成建议",
                sample_text=sample, bt=bt,
            )
        except Exception as exc:
            logger.warning("KR 完成建议生成失败：%s", exc)

    return {"ok": True, "advice": advice}


@router.get("/me/advice")
async def my_advice(user_open_id: str, kr_record_id: Optional[str] = None) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        raise HTTPException(404, "用户未注册")
    filter_ = f'CurrentValue.[用户 ID]="{user["record_id"]}"'
    if kr_record_id:
        filter_ = f'AND({filter_},CurrentValue.[关联 KR]="{kr_record_id}")'
    records = await bt.list_records(bt.table("ai_advice"), filter_=filter_)
    records.sort(key=lambda r: r["fields"].get("生成日期", 0), reverse=True)
    return {
        "items": [
            {
                "id": r["record_id"],
                "type": r["fields"].get("建议类型", ""),
                "date": r["fields"].get("生成日期"),
                "summary": r["fields"].get("核心建议（摘要）", ""),
                "doc_url": r["fields"].get("云文档 URL", ""),
            }
            for r in records[:50]
        ]
    }
