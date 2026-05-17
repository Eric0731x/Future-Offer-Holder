"""配置加载层。

所有外部依赖（飞书、Web、加密密钥）都通过环境变量注入，
模型与 MCP 配置则**完全从飞书表加载**（见 T9/T10），不在此处出现。
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # 飞书应用
    feishu_app_id: str = ""
    feishu_app_secret: str = ""
    feishu_verify_token: str = ""
    feishu_encrypt_key: str = ""

    # 飞书多维表格
    feishu_base_token: str = ""
    table_id_user_profile: str = ""
    table_id_field_options: str = ""
    table_id_jd_pool: str = ""
    table_id_okr: str = ""
    table_id_kr_progress: str = ""
    table_id_learning_log: str = ""
    table_id_internship_match: str = ""
    table_id_ai_advice: str = ""
    table_id_model_config: str = ""
    table_id_mcp_source: str = ""

    # 飞书云文档
    feishu_knowledge_space_id: str = ""
    feishu_report_folder_token: str = ""
    feishu_advice_folder_token: str = ""
    feishu_path_folder_token: str = ""

    # 飞书群聊
    feishu_chat_id: str = ""

    # Web
    web_host: str = "0.0.0.0"
    web_port: int = 8000
    web_public_url: str = "http://localhost:8000"

    # 加密
    secret_fernet_key: Optional[str] = None

    # 模型路由热加载
    model_reload_interval: int = Field(default=60, ge=10)

    def table_id_by_name(self, name: str) -> str:
        """便于按表名称统一查找。"""
        mapping = {
            "user_profile": self.table_id_user_profile,
            "field_options": self.table_id_field_options,
            "jd_pool": self.table_id_jd_pool,
            "okr": self.table_id_okr,
            "kr_progress": self.table_id_kr_progress,
            "learning_log": self.table_id_learning_log,
            "internship_match": self.table_id_internship_match,
            "ai_advice": self.table_id_ai_advice,
            "model_config": self.table_id_model_config,
            "mcp_source": self.table_id_mcp_source,
        }
        if name not in mapping:
            raise KeyError(f"未知表名: {name}")
        return mapping[name]


@lru_cache
def get_settings() -> Settings:
    return Settings()
