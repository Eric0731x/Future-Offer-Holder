"""Prompt 模板加载工具。"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

_PROMPT_DIR = Path(__file__).parent


@lru_cache
def load(name: str) -> str:
    """按名加载 Prompt 模板（无扩展名，从 ai/prompts/<name>.md 读取）。"""
    path = _PROMPT_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")


def render(name: str, **kwargs) -> str:
    """加载模板并填充占位符（{var} 风格）。"""
    tpl = load(name)
    # 避免对未提供变量抛 KeyError —— 使用 format_map + defaultdict 行为
    class _Safe(dict):
        def __missing__(self, key):
            return "{" + key + "}"

    return tpl.format_map(_Safe(**kwargs))
