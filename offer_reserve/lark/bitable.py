"""飞书多维表格操作封装。

封装 10 张业务表的 CRUD。所有方法接收 / 返回 dict（fields 透传）。
"""

from __future__ import annotations

from typing import Any, Iterable, Optional

from offer_reserve.config import get_settings
from offer_reserve.lark.client import LarkClient, get_client


class BitableClient:
    def __init__(self, client: Optional[LarkClient] = None) -> None:
        self.client = client or get_client()
        self.settings = get_settings()
        self.app_token = self.settings.feishu_base_token

    # ---------- 基础 CRUD ----------

    async def list_records(
        self,
        table_id: str,
        *,
        filter_: Optional[str] = None,
        sort: Optional[str] = None,
        page_size: int = 100,
    ) -> list[dict]:
        """分页拉取全部记录。filter_/sort 是飞书表达式语法字符串。"""
        records: list[dict] = []
        page_token: Optional[str] = None
        while True:
            params: dict[str, Any] = {"page_size": page_size}
            if page_token:
                params["page_token"] = page_token
            if filter_:
                params["filter"] = filter_
            if sort:
                params["sort"] = sort
            data = await self.client.request(
                "GET",
                f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records",
                params=params,
            )
            items = data.get("data", {}).get("items", []) or []
            records.extend(items)
            page_token = data.get("data", {}).get("page_token")
            if not page_token or not data.get("data", {}).get("has_more"):
                break
        return records

    async def get_record(self, table_id: str, record_id: str) -> dict:
        data = await self.client.request(
            "GET",
            f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records/{record_id}",
        )
        return data.get("data", {}).get("record", {})

    async def create_record(self, table_id: str, fields: dict) -> dict:
        data = await self.client.request(
            "POST",
            f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records",
            json={"fields": fields},
        )
        return data.get("data", {}).get("record", {})

    async def batch_create(self, table_id: str, records: Iterable[dict]) -> list[dict]:
        payload = {"records": [{"fields": r} for r in records]}
        data = await self.client.request(
            "POST",
            f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records/batch_create",
            json=payload,
        )
        return data.get("data", {}).get("records", []) or []

    async def update_record(self, table_id: str, record_id: str, fields: dict) -> dict:
        data = await self.client.request(
            "PUT",
            f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records/{record_id}",
            json={"fields": fields},
        )
        return data.get("data", {}).get("record", {})

    async def delete_record(self, table_id: str, record_id: str) -> None:
        await self.client.request(
            "DELETE",
            f"/bitable/v1/apps/{self.app_token}/tables/{table_id}/records/{record_id}",
        )

    # ---------- 业务语义快捷方法 ----------

    def table(self, name: str) -> str:
        return self.settings.table_id_by_name(name)

    async def find_user_by_open_id(self, open_id: str) -> Optional[dict]:
        filter_ = f'CurrentValue.[用户 ID]="{open_id}"'
        items = await self.list_records(self.table("user_profile"), filter_=filter_, page_size=1)
        return items[0] if items else None

    async def upsert_user(self, open_id: str, fields: dict) -> dict:
        """按 open_id upsert 用户档案。"""
        existing = await self.find_user_by_open_id(open_id)
        merged = {"用户 ID": open_id, **fields}
        if existing:
            return await self.update_record(
                self.table("user_profile"), existing["record_id"], merged
            )
        return await self.create_record(self.table("user_profile"), merged)

    async def list_field_options(self, *, only_enabled: bool = True) -> list[dict]:
        filter_ = "CurrentValue.[启用]=TRUE()" if only_enabled else None
        return await self.list_records(self.table("field_options"), filter_=filter_)

    async def list_current_okr(self, user_record_id: str) -> Optional[dict]:
        filter_ = (
            f'AND(CurrentValue.[用户 ID]="{user_record_id}",CurrentValue.[状态]="进行中")'
        )
        items = await self.list_records(self.table("okr"), filter_=filter_, page_size=1)
        return items[0] if items else None

    async def list_krs_of_okr(self, okr_record_id: str) -> list[dict]:
        filter_ = f'CurrentValue.[所属 OKR]="{okr_record_id}"'
        return await self.list_records(self.table("kr_progress"), filter_=filter_)

    async def list_logs_in_range(
        self,
        user_record_id: str,
        start_ts_ms: int,
        end_ts_ms: int,
    ) -> list[dict]:
        filter_ = (
            f'AND(CurrentValue.[用户 ID]="{user_record_id}",'
            f"CurrentValue.[日志日期]>={start_ts_ms},"
            f"CurrentValue.[日志日期]<={end_ts_ms})"
        )
        return await self.list_records(self.table("learning_log"), filter_=filter_)
