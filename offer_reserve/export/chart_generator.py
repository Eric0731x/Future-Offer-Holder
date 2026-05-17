"""可视化图表生成 — 输出 SVG 字符串，便于 HTML / LaTeX 复用。"""

from __future__ import annotations

import math
from typing import Iterable


def progress_bars_svg(krs: list[dict], *, width: int = 600) -> str:
    """KR 进度条 SVG。"""
    if not krs:
        return ""
    row_h = 22
    h = row_h * len(krs) + 20
    rows = []
    for i, kr in enumerate(krs):
        name = (kr.get("KR 内容") or "")[:24]
        p = int(kr.get("完成度") or 0)
        y = 10 + i * row_h
        bar_w = int((width - 220) * p / 100)
        rows.append(
            f'<text x="10" y="{y + 14}" font-size="12" fill="#333">{name}</text>'
            f'<rect x="180" y="{y + 4}" width="{width - 220}" height="14" fill="#eee" rx="3" />'
            f'<rect x="180" y="{y + 4}" width="{bar_w}" height="14" fill="#3b82f6" rx="3" />'
            f'<text x="{width - 30}" y="{y + 14}" font-size="11" fill="#333">{p}%</text>'
        )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{h}">'
        + "".join(rows)
        + "</svg>"
    )


def radar_svg(labels: Iterable[str], values: Iterable[int], *, size: int = 320) -> str:
    """简单雷达图。values 应在 0-100。"""
    labels = list(labels)
    values = list(values)
    if not labels or len(labels) != len(values):
        return ""
    cx = cy = size / 2
    r = size / 2 - 40
    n = len(labels)
    polygon = []
    rings = []
    axes = []
    label_texts = []
    for ring in (0.25, 0.5, 0.75, 1.0):
        pts = []
        for i in range(n):
            angle = -math.pi / 2 + 2 * math.pi * i / n
            x = cx + r * ring * math.cos(angle)
            y = cy + r * ring * math.sin(angle)
            pts.append(f"{x:.1f},{y:.1f}")
        rings.append(f'<polygon points="{" ".join(pts)}" fill="none" stroke="#ddd" />')
    for i, (label, v) in enumerate(zip(labels, values)):
        angle = -math.pi / 2 + 2 * math.pi * i / n
        rx = cx + r * math.cos(angle)
        ry = cy + r * math.sin(angle)
        axes.append(f'<line x1="{cx}" y1="{cy}" x2="{rx:.1f}" y2="{ry:.1f}" stroke="#ddd" />')
        lx = cx + (r + 18) * math.cos(angle)
        ly = cy + (r + 18) * math.sin(angle)
        label_texts.append(
            f'<text x="{lx:.1f}" y="{ly:.1f}" font-size="11" text-anchor="middle" fill="#333">{label}</text>'
        )
        vr = r * (max(0, min(100, v)) / 100)
        px = cx + vr * math.cos(angle)
        py = cy + vr * math.sin(angle)
        polygon.append(f"{px:.1f},{py:.1f}")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}">'
        + "".join(rings + axes)
        + f'<polygon points="{" ".join(polygon)}" fill="#3b82f640" stroke="#3b82f6" stroke-width="1.5" />'
        + "".join(label_texts)
        + "</svg>"
    )
