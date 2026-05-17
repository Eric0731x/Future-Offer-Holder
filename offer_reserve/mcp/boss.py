"""Boss 直聘适配（默认走通用 REST 协议；如有专用 MCP server 可在此实现）。"""

from offer_reserve.mcp.generic import GenericSource


class BossSource(GenericSource):
    """复用 GenericSource：服务端 MCP/REST 网关负责实际抓取与合规。"""
