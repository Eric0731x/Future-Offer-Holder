"""指令：`路径 <KR>` — 查看某条 KR 的学习路径文档链接。"""

from __future__ import annotations

import logging
from typing import Optional

from offer_reserve.ai import prompts
from offer_reserve.ai.router import get_router
from offer_reserve.config import get_settings
from offer_reserve.lark.bitable import BitableClient
from offer_reserve.lark.docs import DocsClient
from offer_reserve.lark.messaging import action_row, button, card, md

logger = logging.getLogger(__name__)


async def handle(user_open_id: str, arg: str) -> dict:
    target = (arg or "").strip()
    if not target:
        return {"ok": False, "msg": "用法：路径 <KR 名称或编号>"}

    bt = BitableClient()
    settings = get_settings()

    user = await bt.find_user_by_open_id(user_open_id)
    if not user:
        return {"ok": False, "msg": "请先完成用户档案登记"}
    okr = await bt.list_current_okr(user["record_id"])
    if not okr:
        return {"ok": False, "msg": "尚未锚定方向"}

    krs = await bt.list_krs_of_okr(okr["record_id"])
    kr = _match_kr(krs, target)
    if not kr:
        names = "、".join(r["fields"].get("KR 内容", "")[:14] for r in krs[:8])
        return {"ok": False, "msg": f"未找到 KR「{target}」。当前 KR：{names}"}

    fields = kr["fields"]
    url = fields.get("路径文档 URL") or _okr_default_path(okr)

    if not url:
        # 没有现成路径文档时，按需即时生成一份并写回
        url = await _generate_path_doc(bt, DocsClient(), kr)
        if url:
            await bt.update_record(bt.table("kr_progress"), kr["record_id"], {"路径文档 URL": url})

    if not url:
        return {"ok": False, "msg": "路径文档生成失败，请稍后重试"}

    return {
        "ok": True,
        "data": {"url": url},
        "card": card(
            f"📚 学习路径：{fields.get('KR 内容', '')}",
            [
                md(f"分类：{fields.get('分类','')}　|　优先级：{fields.get('优先级','')}　|　完成度：{fields.get('完成度',0)}%"),
                md(f"JD 锚点：{fields.get('JD 锚点','—')}"),
                action_row(button("打开路径文档", url=url)),
            ],
        ),
    }


def _match_kr(krs: list[dict], target: str) -> Optional[dict]:
    t = target.replace(" ", "").lower()
    for r in krs:
        name = (r["fields"].get("KR 内容") or "").replace(" ", "").lower()
        if name and (name == t or t in name):
            return r
    return None


def _okr_default_path(okr: dict) -> str:
    return okr.get("fields", {}).get("路径文档 URL", "") or ""


async def _generate_path_doc(bt: BitableClient, docs: DocsClient, kr: dict) -> str:
    settings = get_settings()
    folder = settings.feishu_path_folder_token or settings.feishu_knowledge_space_id
    if not folder:
        return ""
    name = kr["fields"].get("KR 内容", "未命名 KR")
    try:
        doc = await docs.create_docx(title=f"路径_{name}", folder_token=folder)
        doc_id = doc.get("document_id", "")
        if not doc_id:
            return ""
        rendered = prompts.render(
            "path",
            kr_name=name,
            category=kr["fields"].get("分类", ""),
            jd_anchor=kr["fields"].get("JD 锚点", ""),
        )
        body = await get_router().call(rendered, task_type="路径")
        await docs.append_markdown(doc_id, body)
        return f"https://feishu.cn/docx/{doc_id}"
    except Exception as exc:
        logger.warning("生成路径文档失败：%s", exc)
        return ""
