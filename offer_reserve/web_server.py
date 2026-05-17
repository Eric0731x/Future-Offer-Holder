"""Web 后端入口（FastAPI）。

聚合：
- 飞书事件回调 /lark/event
- 学习日志 / KR API /api/*
- 启动时挂载 APScheduler，加载模型与 MCP 配置
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from offer_reserve.ai.router import get_router as get_model_router
from offer_reserve.bot import router as lark_router
from offer_reserve.checkin.api import router as checkin_router
from offer_reserve.checkin.scheduler import build_scheduler
from offer_reserve.config import get_settings
from offer_reserve.mcp.registry import get_registry

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
)
logger = logging.getLogger("offer_reserve")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("启动 OFFER 预备役 Web 服务 — %s:%d", settings.web_host, settings.web_port)
    # 预热模型 / MCP 配置（失败不阻塞启动）
    try:
        await get_model_router().reload()
    except Exception as exc:
        logger.warning("模型路由预热失败：%s", exc)
    try:
        await get_registry().reload()
    except Exception as exc:
        logger.warning("MCP 注册器预热失败：%s", exc)

    scheduler = build_scheduler()
    scheduler.start()
    app.state.scheduler = scheduler
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


def create_app() -> FastAPI:
    app = FastAPI(title="OFFER 预备役", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(lark_router)
    app.include_router(checkin_router)

    @app.get("/health")
    async def health() -> dict:
        return {"ok": True}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "offer_reserve.web_server:app",
        host=settings.web_host,
        port=settings.web_port,
        reload=False,
    )
