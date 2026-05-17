"""AI 建议生成器。

约束：
- AI 是教练不是判官（Prompt 已约束语气）
- 每个 KR 一份建议文档，持续追加，不新建
- 表（T8）只存元数据，正文写入云文档
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Literal, Optional

from offer_reserve.ai import prompts
from offer_reserve.ai.router import get_router
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.docs import DocsClient

logger = logging.getLogger(__name__)

AdviceType = Literal["日建议", "周建议", "月建议", "学期建议", "KR 完成建议"]


async def generate_advice(
    user_record_id: str,
    kr_record_id: str,
    advice_type: AdviceType,
    *,
    sample_text: str,
    bt: Optional[BitableClient] = None,
    docs: Optional[DocsClient] = None,
) -> dict:
    bt = bt or BitableClient()
    docs = docs or DocsClient()

    user = await bt.get_record(bt.table("user_profile"), user_record_id)
    kr = await bt.get_record(bt.table("kr_progress"), kr_record_id)
    if not kr:
        raise ValueError("KR 不存在")
    user_brief = (
        f'{user.get("fields",{}).get("姓名","")}　|　'
        f'OKR ID：{(kr.get("fields",{}).get("所属 OKR") or [""])[0]}'
    )
    rendered = prompts.render(
        "advice",
        user_brief=user_brief,
        kr_name=kr["fields"].get("KR 内容", ""),
        category=kr["fields"].get("分类", ""),
        progress=kr["fields"].get("完成度", 0),
        advice_type=advice_type,
        sample=sample_text or "（无样本）",
    )
    raw = await get_router().call(rendered, task_type="建议")
    parsed = _safe_load_json(raw)

    advice_md = _render_markdown(advice_type, parsed)
    advice_url = kr["fields"].get("建议文档 URL", "") or ""
    doc_id = _extract_doc_id(advice_url)
    if doc_id:
        try:
            await docs.prepend_markdown(doc_id, advice_md)
        except Exception as exc:
            logger.warning("追加建议文档失败：%s", exc)

    # 写入 T8 元数据
    record = await bt.create_record(
        bt.table("ai_advice"),
        {
            "用户 ID": [user_record_id],
            "关联 KR": [kr_record_id],
            "建议类型": advice_type,
            "生成日期": int(datetime.utcnow().timestamp() * 1000),
            "数据样本摘要": sample_text[:1000],
            "完成度参考": int(parsed.get("完成度参考") or 0),
            "核心建议（摘要）": str(parsed.get("核心建议摘要") or "")[:200],
            "推荐资料": _render_recos(parsed.get("推荐资料")),
            "云文档 URL": advice_url,
        },
    )

    # 回写 T4：最近一次建议
    okr_ref = (kr["fields"].get("所属 OKR") or [None])[0]
    if okr_ref:
        try:
            await bt.update_record(
                bt.table("okr"), okr_ref, {"最近一次建议": [record.get("record_id", "")]}
            )
        except Exception:
            pass

    return {
        "ok": True,
        "advice_record_id": record.get("record_id", ""),
        "summary": parsed.get("核心建议摘要", ""),
        "advice_url": advice_url,
    }


# ----------------------------------------------------------------------------
# 渲染
# ----------------------------------------------------------------------------

def _render_markdown(advice_type: str, parsed: dict) -> str:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    lines = [f"## {today} {advice_type}", ""]
    summary = parsed.get("核心建议摘要")
    if summary:
        lines += [f"> {summary}", ""]
    for section in ("你做得不错的地方", "值得思考的地方", "下一步具体建议"):
        items = parsed.get(section) or []
        if items:
            lines.append(f"### {section}")
            for it in items:
                lines.append(f"- {it}")
            lines.append("")
    recos = parsed.get("推荐资料") or []
    if recos:
        lines.append("### 推荐资料")
        for r in recos:
            title = r.get("title", "")
            url = r.get("url", "")
            if title and url:
                lines.append(f"- [{title}]({url})")
            elif title:
                lines.append(f"- {title}")
        lines.append("")
    lines.append("---")
    return "\n".join(lines)


def _render_recos(recos) -> str:
    if not isinstance(recos, list):
        return ""
    parts = []
    for r in recos:
        if isinstance(r, dict):
            t, u = r.get("title", ""), r.get("url", "")
            if t and u:
                parts.append(f"{t} {u}")
            elif t:
                parts.append(t)
    return "\n".join(parts)


def _extract_doc_id(url: str) -> str:
    if not url:
        return ""
    # https://feishu.cn/docx/{doc_id}
    if "/docx/" in url:
        return url.rsplit("/docx/", 1)[-1].split("?", 1)[0]
    return ""


def _safe_load_json(text: str) -> dict:
    try:
        clean = text.strip().strip("`")
        if clean.lower().startswith("json"):
            clean = clean[4:].strip()
        return json.loads(clean)
    except Exception:
        return {}
