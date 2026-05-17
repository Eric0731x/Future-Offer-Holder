"""飞书云文档操作封装。

仅使用四类能力：
1. 在指定文件夹下创建 docx 文档；
2. 向 docx 顶部追加 Markdown 段（建议追加模式）；
3. 上传文件到云空间（PDF/LaTeX 导出归档）；
4. 读取文档全文（路径/建议正文回显）。
"""

from __future__ import annotations

import io
import os
from typing import Optional

import httpx

from offer_reserve.config import get_settings
from offer_reserve.lark.client import LarkClient, get_client


class DocsClient:
    def __init__(self, client: Optional[LarkClient] = None) -> None:
        self.client = client or get_client()
        self.settings = get_settings()

    # ---------- 文档 ----------

    async def create_docx(self, title: str, folder_token: Optional[str] = None) -> dict:
        payload = {"title": title}
        if folder_token:
            payload["folder_token"] = folder_token
        data = await self.client.request("POST", "/docx/v1/documents", json=payload)
        return data.get("data", {}).get("document", {})

    async def get_docx_blocks(self, document_id: str) -> list[dict]:
        data = await self.client.request(
            "GET", f"/docx/v1/documents/{document_id}/blocks", params={"page_size": 500}
        )
        return data.get("data", {}).get("items", []) or []

    async def get_docx_raw_content(self, document_id: str) -> str:
        data = await self.client.request(
            "GET", f"/docx/v1/documents/{document_id}/raw_content"
        )
        return data.get("data", {}).get("content", "") or ""

    async def append_markdown(self, document_id: str, markdown: str) -> None:
        """把一段 Markdown 追加到 docx 末尾。

        实现策略：将 markdown 拆分成段落 + 标题 block，调用 children/batch_create。
        为保持精简，这里只支持基础语法（标题、段落、列表项）。
        """
        blocks = _markdown_to_blocks(markdown)
        if not blocks:
            return
        # docx 文档的根 block_id == document_id
        await self.client.request(
            "POST",
            f"/docx/v1/documents/{document_id}/blocks/{document_id}/children",
            json={"children": blocks, "index": -1},
        )

    async def prepend_markdown(self, document_id: str, markdown: str) -> None:
        """把 Markdown 段插入文档开头（建议文档"按时间倒序"用）。"""
        blocks = _markdown_to_blocks(markdown)
        if not blocks:
            return
        await self.client.request(
            "POST",
            f"/docx/v1/documents/{document_id}/blocks/{document_id}/children",
            json={"children": blocks, "index": 0},
        )

    # ---------- 云空间文件 ----------

    async def upload_file(
        self,
        filename: str,
        content: bytes,
        parent_folder_token: str,
        parent_type: str = "explorer",
    ) -> dict:
        """上传二进制到云空间文件夹，返回 {file_token, url}。"""
        token = await self.client.token()
        headers = {"Authorization": f"Bearer {token}"}
        files = {
            "file_name": (None, filename),
            "parent_type": (None, parent_type),
            "parent_node": (None, parent_folder_token),
            "size": (None, str(len(content))),
            "file": (filename, io.BytesIO(content)),
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(
                "https://open.feishu.cn/open-apis/drive/v1/files/upload_all",
                headers=headers,
                files=files,
            )
            data = resp.json()
        if data.get("code") != 0:
            raise RuntimeError(f"上传文件失败: {data}")
        return data.get("data", {})


# ----------------------------------------------------------------------------
# Markdown → Docx blocks（最小可用子集）
# ----------------------------------------------------------------------------

def _markdown_to_blocks(markdown: str) -> list[dict]:
    """极简 Markdown → docx block 转换。

    支持：# / ## / ### 标题，- 无序列表，1. 有序列表，普通段落，--- 分割线。
    不支持表格、复杂嵌套（建议在云文档里手工编辑/复杂渲染走 PDF/LaTeX 路径）。
    """
    blocks: list[dict] = []
    for raw in markdown.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("### "):
            blocks.append(_heading(line[4:], level=3))
        elif line.startswith("## "):
            blocks.append(_heading(line[3:], level=2))
        elif line.startswith("# "):
            blocks.append(_heading(line[2:], level=1))
        elif line.strip() in {"---", "***"}:
            blocks.append({"block_type": 22, "divider": {}})
        elif line.lstrip().startswith(("- ", "* ")):
            text = line.lstrip()[2:]
            blocks.append(_bullet(text))
        elif _is_ordered(line):
            _, text = line.split(".", 1)
            blocks.append(_ordered(text.strip()))
        else:
            blocks.append(_paragraph(line))
    return blocks


def _is_ordered(line: str) -> bool:
    head = line.lstrip().split(".", 1)
    return len(head) == 2 and head[0].isdigit()


def _text_element(text: str) -> dict:
    return {"text_run": {"content": text}}


def _heading(text: str, level: int) -> dict:
    # docx block_type: 3=heading1, 4=heading2, 5=heading3
    block_type = {1: 3, 2: 4, 3: 5}[level]
    key = {1: "heading1", 2: "heading2", 3: "heading3"}[level]
    return {"block_type": block_type, key: {"elements": [_text_element(text)]}}


def _paragraph(text: str) -> dict:
    return {"block_type": 2, "text": {"elements": [_text_element(text)]}}


def _bullet(text: str) -> dict:
    return {"block_type": 12, "bullet": {"elements": [_text_element(text)]}}


def _ordered(text: str) -> dict:
    return {"block_type": 13, "ordered": {"elements": [_text_element(text)]}}
