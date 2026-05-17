"""六个指令冒烟测试。

不实际打飞书，使用 dispatch 函数；需要 .env 配置 + 真实表 ID。
"""

from __future__ import annotations

import asyncio
import sys

from offer_reserve.commands import dispatch


CASES = [
    "锚定 产品经理",
    "拆解",
    "本周",
    "路径 用户需求分析能力",
    "实习",
    "导出 周报 pdf",
]


async def main(open_id: str) -> None:
    for cmd in CASES:
        print(f"\n>>> {cmd}")
        result = await dispatch(open_id, cmd)
        print({k: v for k, v in result.items() if k != "card"})


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python -m offer_reserve.scripts.smoke_commands <user_open_id>")
        sys.exit(1)
    asyncio.run(main(sys.argv[1]))
