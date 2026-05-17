"""指令：`锚定 <方向>`。

业务流程：
1. 校验方向必须来自 T2（不允许自由输入）
2. 触发 MCP 抓取该方向最新 ≤50 条 JD 写入 T3
3. AI 生成 Objective 写入 T4
4. 返回卡片：Objective + 引导执行 `拆解`
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Optional

from offer_reserve.ai import prompts
from offer_reserve.ai.router import get_router
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.messaging import action_row, button, card, divider, md
from offer_reserve.mcp.registry import get_registry

logger = logging.getLogger(__name__)


async def handle(user_open_id: str, arg: str) -> dict:
    bt = BitableClient()
    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        return {"ok": False, "msg": "请先完成用户档案登记后再使用本指令"}

    target = (arg or "").strip()
    if not target:
        options = await bt.list_field_options()
        sample = "、".join({opt["fields"].get("细分方向", "") for opt in options[:10] if opt.get("fields", {}).get("细分方向")})
        return {
            "ok": False,
            "msg": f"用法：锚定 <方向名>。例：锚定 产品经理 / 量化交易。可选方向示例：{sample}",
        }

    field_record = await _match_field(bt, target)
    if not field_record:
        return {
            "ok": False,
            "msg": f"方向「{target}」不在系统预置选项库（T2）中。方向只能选择，不能自由输入。",
        }

    field_fields = field_record["fields"]
    field_name = field_fields.get("细分方向", "")

    # 1. MCP 抓取 JD 写入 T3
    jds_added = await _fetch_and_store_jds(bt, field_record, field_name)

    # 2. AI 生成 Objective
    user_fields = user["fields"]
    user_brief = (
        f'{user_fields.get("姓名", "")}，{user_fields.get("学校", "")} '
        f'{user_fields.get("专业", "")} {user_fields.get("年级", "")}'
    )
    field_full = f'{field_fields.get("大类", "")} / {field_name}'
    jd_summary = await _summarise_recent_jds(bt, field_record["record_id"])

    rendered = prompts.render("anchor", user_brief=user_brief, field=field_full, jd_summary=jd_summary)
    raw = await get_router().call(rendered, task_type="锚定")
    parsed = _safe_load_json(raw)
    objective = parsed.get("objective") or f"未来加入{field_name}领域头部公司"
    target_time = parsed.get("target_time") or _default_target(user_fields)
    rationale = parsed.get("rationale") or ""

    # 3. 写入 T4 OKR
    okr_record = await bt.create_record(
        bt.table("okr"),
        {
            "用户 ID": [user["record_id"]],
            "Objective": objective,
            "锚定方向": [field_record["record_id"]],
            "目标时间": _to_ms(target_time),
            "创建时间": _now_ms(),
            "状态": "进行中",
            "关联 JD 数": jds_added,
            "路径文档 URL": field_fields.get("路径文档 URL", ""),
        },
    )

    # 4. 回写 T1 当前 OKR / 锚定方向
    await bt.update_record(
        bt.table("user_profile"),
        user["record_id"],
        {
            "锚定大类": field_fields.get("大类", ""),
            "锚定细分": [field_record["record_id"]],
            "当前 OKR ID": [okr_record.get("record_id", "")],
            "最后活跃": _now_ms(),
        },
    )

    return {
        "ok": True,
        "data": {
            "objective": objective,
            "target_time": target_time,
            "okr_id": okr_record.get("record_id", ""),
            "jds_added": jds_added,
        },
        "card": card(
            f"✅ 已锚定方向：{field_name}",
            [
                md(f"**目标 Objective**\n{objective}"),
                md(f"**目标时间**：{target_time}"),
                md(f"**抓取 JD**：{jds_added} 条"),
                md(f"**理由**：{rationale or '—'}"),
                divider(),
                md("下一步：请发送指令 **拆解**，把 JD 拆成你的 KR 列表。"),
                action_row(button("📚 查看方向路径", url=field_fields.get("路径文档 URL", "") or None)),
            ],
        ),
    }


# ----------------------------------------------------------------------------
# 辅助
# ----------------------------------------------------------------------------

async def _match_field(bt: BitableClient, target: str) -> Optional[dict]:
    options = await bt.list_field_options()
    target_norm = target.replace(" ", "").lower()
    for opt in options:
        name = (opt.get("fields", {}).get("细分方向") or "").replace(" ", "").lower()
        if name and name == target_norm:
            return opt
    # 模糊：包含
    for opt in options:
        name = (opt.get("fields", {}).get("细分方向") or "").replace(" ", "").lower()
        if name and target_norm in name:
            return opt
    return None


async def _fetch_and_store_jds(bt: BitableClient, field_rec: dict, field_name: str) -> int:
    try:
        items = await get_registry().fetch_jds(field_name, limit_per_source=50)
    except Exception as exc:
        logger.warning("MCP 抓取失败：%s", exc)
        items = []
    if not items:
        return 0
    payload = [
        {
            "关联方向": [field_rec["record_id"]],
            "来源平台": item.source,
            "公司": item.company,
            "岗位": item.position,
            "JD 原文": item.jd_text,
            "抓取时间": _now_ms(),
            "参与共性分析": True,
        }
        for item in items[:50]
    ]
    created = await bt.batch_create(bt.table("jd_pool"), payload)
    return len(created)


async def _summarise_recent_jds(bt: BitableClient, field_record_id: str, limit: int = 20) -> str:
    filter_ = f'CurrentValue.[关联方向]="{field_record_id}"'
    records = await bt.list_records(bt.table("jd_pool"), filter_=filter_)
    snippets: list[str] = []
    for r in records[:limit]:
        text = (r.get("fields", {}).get("JD 原文") or "")[:200]
        if text:
            snippets.append(f"- {text}")
    return "\n".join(snippets) or "（暂无 JD 样本）"


def _safe_load_json(text: str) -> dict:
    try:
        # 容错：去除可能的 ```json 包裹
        clean = text.strip().strip("`")
        if clean.lower().startswith("json"):
            clean = clean[4:].strip()
        return json.loads(clean)
    except Exception:
        return {}


def _now_ms() -> int:
    return int(datetime.utcnow().timestamp() * 1000)


def _to_ms(date_str: str) -> int:
    try:
        return int(datetime.strptime(date_str, "%Y-%m-%d").timestamp() * 1000)
    except Exception:
        return _now_ms()


def _default_target(user_fields: dict) -> str:
    enroll = int(user_fields.get("入学年份") or datetime.utcnow().year)
    # 本科默认毕业月：4 年
    grad_year = enroll + 4
    return f"{grad_year}-06-30"
