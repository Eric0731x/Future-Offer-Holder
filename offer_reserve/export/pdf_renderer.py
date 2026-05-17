"""PDF 渲染：Markdown → HTML → PDF (WeasyPrint)。"""

from __future__ import annotations

import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from offer_reserve.export.chart_generator import progress_bars_svg, radar_svg

logger = logging.getLogger(__name__)

_TPL_DIR = Path(__file__).parent.parent / "templates" / "pdf"
_env = Environment(
    loader=FileSystemLoader(str(_TPL_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_pdf(period: str, data: dict) -> bytes:
    """渲染 PDF；如未安装 WeasyPrint，则降级返回 HTML 字节并打 warning。"""
    template_name = f"{period}.html"
    template = _env.get_template(template_name)
    krs = data.get("krs", [])
    chart_progress = progress_bars_svg(krs)
    chart_radar = radar_svg(
        [k.get("KR 内容", "")[:8] for k in krs[:6]],
        [int(k.get("完成度") or 0) for k in krs[:6]],
    )
    html = template.render(data=data, chart_progress=chart_progress, chart_radar=chart_radar)
    try:
        from weasyprint import HTML  # type: ignore

        return HTML(string=html, base_url=str(_TPL_DIR)).write_pdf()
    except Exception as exc:
        logger.warning("WeasyPrint 不可用，降级输出 HTML：%s", exc)
        return html.encode("utf-8")
