"""指令：`导出 <周期> <格式>`。"""

from __future__ import annotations

from offer_reserve.export.builder import export_report
from offer_reserve.lark.messaging import action_row, button, card, md


PERIOD_ALIASES = {
    "周报": "weekly",
    "周": "weekly",
    "月报": "monthly",
    "月": "monthly",
    "学期报": "semester",
    "学期": "semester",
    "总报告": "overall",
    "总": "overall",
}
FORMAT_ALIASES = {"pdf": "pdf", "PDF": "pdf", "latex": "latex", "LaTeX": "latex", "tex": "latex", "both": "both"}


async def handle(user_open_id: str, arg: str) -> dict:
    parts = (arg or "").split()
    if len(parts) < 2:
        return {
            "ok": False,
            "msg": "用法：导出 <周报|月报|学期报|总报告> <pdf|latex|both>",
        }
    period = PERIOD_ALIASES.get(parts[0])
    fmt = FORMAT_ALIASES.get(parts[1])
    if not period or not fmt:
        return {"ok": False, "msg": "周期或格式不识别"}

    result = await export_report(user_open_id, period=period, fmt=fmt)
    if not result.get("ok"):
        return result

    buttons = []
    if result.get("pdf_url"):
        buttons.append(button("📄 下载 PDF", url=result["pdf_url"]))
    if result.get("latex_url"):
        buttons.append(button("📐 下载 LaTeX", url=result["latex_url"]))

    return {
        "ok": True,
        "data": result,
        "card": card(
            f"📑 已生成 {parts[0]}",
            [
                md(f"周期：{parts[0]}　|　格式：{parts[1]}"),
                md("文件已归档到飞书云文档「用户报告归档」目录。"),
                action_row(*buttons) if buttons else md("（未生成可下载链接）"),
            ],
        ),
    }
