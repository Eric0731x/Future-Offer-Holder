"""导出编排器：拉数据 → 渲染 → 上传 → 返回链接。"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Literal

from offer_reserve.config import get_settings
from offer_reserve.export.data_collector import collect_report_data
from offer_reserve.export.latex_renderer import render_latex
from offer_reserve.export.pdf_renderer import render_pdf
from offer_reserve.lark.docs import DocsClient

logger = logging.getLogger(__name__)

Period = Literal["weekly", "monthly", "semester", "overall"]
Format = Literal["pdf", "latex", "both"]


async def export_report(user_open_id: str, *, period: Period, fmt: Format) -> dict:
    settings = get_settings()
    try:
        data = await collect_report_data(user_open_id, period)
    except ValueError as exc:
        return {"ok": False, "msg": str(exc)}

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    docs = DocsClient()
    folder = settings.feishu_report_folder_token

    result: dict = {"ok": True}
    if fmt in ("pdf", "both"):
        pdf_bytes = render_pdf(period, data)
        filename = f"{period}_{user_open_id}_{timestamp}.pdf"
        url = await _upload(docs, folder, filename, pdf_bytes)
        result["pdf_url"] = url
    if fmt in ("latex", "both"):
        tex_bytes = render_latex(period, data)
        filename = f"{period}_{user_open_id}_{timestamp}.tex"
        url = await _upload(docs, folder, filename, tex_bytes)
        result["latex_url"] = url
    return result


async def _upload(docs: DocsClient, folder: str, filename: str, content: bytes) -> str:
    if not folder:
        logger.warning("FEISHU_REPORT_FOLDER_TOKEN 未配置，跳过上传：%s", filename)
        return ""
    try:
        info = await docs.upload_file(filename, content, parent_folder_token=folder)
        file_token = info.get("file_token", "")
        return f"https://feishu.cn/file/{file_token}" if file_token else ""
    except Exception as exc:
        logger.warning("上传 %s 失败：%s", filename, exc)
        return ""
