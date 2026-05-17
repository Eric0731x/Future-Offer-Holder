"""LaTeX 渲染。

策略：直接使用 LaTeX Jinja2 模板渲染 → 输出 .tex 字符串。
真要 compile 成 PDF，可在容器内调用 latexmk。
"""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader

_TPL_DIR = Path(__file__).parent.parent / "templates" / "latex"
_env = Environment(
    loader=FileSystemLoader(str(_TPL_DIR)),
    block_start_string="<%",
    block_end_string="%>",
    variable_start_string="<<",
    variable_end_string=">>",
    comment_start_string="<#",
    comment_end_string="#>",
    autoescape=False,
)


def render_latex(period: str, data: dict) -> bytes:
    template = _env.get_template(f"{period}.tex")
    return template.render(data=data).encode("utf-8")
