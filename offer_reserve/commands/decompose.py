"""指令：`拆解` — 把当前 OKR 的 JD 池拆成 KR 列表。"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Optional

from offer_reserve.ai import prompts
from offer_reserve.ai.router import get_router
from offer_reserve.config import get_settings
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.docs import DocsClient
from offer_reserve.lark.messaging import action_row, button, card, divider, md

logger = logging.getLogger(__name__)


VALID_CATEGORIES = {"硬技能", "软技能", "项目", "实习", "证书", "竞赛"}
VALID_SEMESTERS = {
    "大一上", "大一下", "大二上", "大二下", "大三上", "大三下", "大四上", "大四下",
    "研一上", "研一下", "研二上", "研二下", "研三上", "研三下",
}
VALID_PRIORITY = {"P0", "P1", "P2"}


async def handle(user_open_id: str, arg: str) -> dict:
    bt = BitableClient()
    docs = DocsClient()
    settings = get_settings()

    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        return {"ok": False, "msg": "请先完成用户档案登记"}

    okr = await bt.list_current_okr(user["record_id"])
    if not okr:
        return {"ok": False, "msg": "尚未锚定方向。请先发送指令：锚定 <方向>"}

    # 检查是否已有 KR（避免重复拆解）
    existing_krs = await bt.list_krs_of_okr(okr["record_id"])
    if existing_krs:
        return {
            "ok": False,
            "msg": f"该 OKR 已有 {len(existing_krs)} 条 KR。如需重新拆解，请先暂停当前 OKR。",
        }

    requirements = await _collect_requirements(bt, okr)
    rendered = prompts.render(
        "decompose",
        objective=okr["fields"].get("Objective", ""),
        user_stage=_user_stage_brief(user["fields"]),
        requirements=requirements,
    )
    raw = await get_router().call(rendered, task_type="拆解")
    items = _safe_load_json_array(raw)
    if not items:
        return {"ok": False, "msg": "AI 拆解失败，请稍后重试"}

    # 写入 T5 + 为每条 KR 创建建议文档
    payload: list[dict] = []
    advice_folder = settings.feishu_advice_folder_token or settings.feishu_knowledge_space_id
    advice_doc_urls: list[str] = []

    for it in items:
        category = it.get("category") if it.get("category") in VALID_CATEGORIES else "硬技能"
        semester = it.get("semester") if it.get("semester") in VALID_SEMESTERS else "大三上"
        priority = it.get("priority") if it.get("priority") in VALID_PRIORITY else "P1"
        kr_name = (it.get("kr") or "").strip()
        if not kr_name:
            continue
        advice_url = ""
        if advice_folder:
            try:
                doc = await docs.create_docx(
                    title=f"建议_{kr_name}",
                    folder_token=advice_folder,
                )
                doc_id = doc.get("document_id", "")
                advice_url = f"https://feishu.cn/docx/{doc_id}" if doc_id else ""
                if doc_id:
                    await docs.append_markdown(
                        doc_id,
                        f"# AI 建议 · {kr_name}\n\n> OKR：{okr['fields'].get('Objective','')}　|　文档持续更新\n",
                    )
                advice_doc_urls.append(advice_url)
            except Exception as exc:
                logger.warning("创建建议文档失败：%s", exc)
        payload.append(
            {
                "所属 OKR": [okr["record_id"]],
                "KR 内容": kr_name,
                "JD 锚点": it.get("jd_anchor", ""),
                "分类": category,
                "所属学期": semester,
                "优先级": priority,
                "完成度": 0,
                "状态": "未开始",
                "预计完成日": _to_ms(it.get("expected_end", "")),
                "投入小时数": 0,
                "建议文档 URL": advice_url,
                "最近更新": _now_ms(),
            }
        )

    if not payload:
        return {"ok": False, "msg": "AI 拆解未产出有效 KR"}

    created = await bt.batch_create(bt.table("kr_progress"), payload)

    # 概览
    by_priority: dict[str, int] = {}
    for p in payload:
        by_priority[p["优先级"]] = by_priority.get(p["优先级"], 0) + 1

    web_board = f"{settings.web_public_url}/kr-board?user={user_open_id}"

    return {
        "ok": True,
        "data": {"count": len(created), "by_priority": by_priority},
        "card": card(
            f"🎯 已拆解出 {len(created)} 条 KR",
            [
                md(f"**P0 / P1 / P2 分布**：{by_priority.get('P0',0)} / {by_priority.get('P1',0)} / {by_priority.get('P2',0)}"),
                md("**每条 KR 已自动建好建议文档**，AI 建议会持续追加。"),
                divider(),
                md("下一步：发送 **本周** 看本周该做什么，或打开 Web 看板。"),
                action_row(button("📊 打开 KR 看板", url=web_board)),
            ],
        ),
    }


# ----------------------------------------------------------------------------
# 辅助
# ----------------------------------------------------------------------------

async def _collect_requirements(bt: BitableClient, okr: dict) -> str:
    """从 OKR 关联方向的 JD 池里提取要求文本。"""
    field_rec = (okr.get("fields", {}).get("锚定方向") or [None])[0]
    field_id = field_rec["record_ids"][0] if isinstance(field_rec, dict) and "record_ids" in field_rec else field_rec
    if not field_id:
        return "（无 JD 关联）"
    filter_ = f'CurrentValue.[关联方向]="{field_id}"'
    records = await bt.list_records(bt.table("jd_pool"), filter_=filter_)
    out: list[str] = []
    for r in records[:30]:
        text = (r.get("fields", {}).get("JD 原文") or "")[:300]
        if text:
            out.append(f"- {text}")
    return "\n".join(out) or "（暂无）"


def _user_stage_brief(uf: dict) -> str:
    return f'年级 {uf.get("年级","未知")}，入学 {uf.get("入学年份","")}'


def _safe_load_json_array(text: str) -> list[dict]:
    try:
        clean = text.strip().strip("`")
        if clean.lower().startswith("json"):
            clean = clean[4:].strip()
        data = json.loads(clean)
        if isinstance(data, list):
            return [x for x in data if isinstance(x, dict)]
        return []
    except Exception:
        return []


def _now_ms() -> int:
    return int(datetime.utcnow().timestamp() * 1000)


def _to_ms(date_str: str) -> Optional[int]:
    if not date_str:
        return None
    try:
        return int(datetime.strptime(date_str, "%Y-%m-%d").timestamp() * 1000)
    except Exception:
        return None
