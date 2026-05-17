# OFFER 预备役 · 业务后端

把目标岗位的 JD 变成大学四年的 OKR，AI 给建议、Web 端打卡、自动生成 PDF/LaTeX 报告。

> 本仓库当前阶段：**业务逻辑层已就位（P0+P1+P2+P3 关键路径）**，前端尚未实现。

---

## 模块总览

```
offer_reserve/
├── bot.py                  飞书事件回调（/lark/event）
├── web_server.py           FastAPI 入口（聚合 bot + checkin api + scheduler）
├── config.py               Pydantic Settings 配置加载
│
├── lark/                   飞书 SDK 封装：client / bitable / docs / messaging
├── ai/                     模型路由 + 三协议 provider + Prompt 模板
├── mcp/                    招聘平台抓取适配（Boss / 实习僧 / 牛客 / 通用）
├── commands/               六个核心指令（锚定 / 拆解 / 本周 / 路径 / 实习 / 导出）
├── checkin/                学习日志 Web API + AI 建议生成 + APScheduler
├── export/                 报告导出（聚合数据 → HTML/PDF 与 LaTeX）
├── templates/              PDF / LaTeX 模板
└── scripts/                T2 选项库种子 + 指令冒烟
```

## 关键设计约束（来自产品文档）

1. **永远只有 6 个指令**：锚定 / 拆解 / 本周 / 路径 / 实习 / 导出。
2. **AI 是教练不是判官**：Prompt 中禁止判定/评级类用语，输出建议而非定论。
3. **建议正文存云文档，元数据存多维表格**：T8 只保元数据；正文按时间倒序追加到每个 KR 唯一的建议文档。
4. **管理员后台 = 飞书表格**：T9/T10 完全由表格驱动，热加载（默认 60s）。
5. **模型完全自定义**：不内置任何 Key，全由 T9 加载，失败自动按 priority 降级。
6. **MCP 只读**：不模拟登录、不写入第三方平台；QPS ≤ 1；3 次失败后跳过。
7. **方向只能选不能输**：用户必须从 T2 选择，命令层做严格校验。
8. **KR 100% 必带证据**：Web API 在 `/api/kr/progress` 层强约束。

## 快速开始

```bash
# 1. 准备环境
cp .env.example .env  # 填入飞书与表 ID
python -m pip install -r requirements.txt

# 2. 在飞书多维表格里创建 10 张表，把每张表 ID 写回 .env
#    至少先建 T1 / T2 / T4 / T5 / T9 即可启动 P0 链路

# 3. 预置 T2 方向（20 条）
python -m offer_reserve.scripts.seed_field_options

# 4. 在 T9 表里加入至少一条模型配置（OpenAI 兼容 / Anthropic / 自定义）

# 5. 启动 Web 服务（同时挂载飞书事件回调 + 定时任务）
python -m offer_reserve.web_server
```

服务暴露：
- `POST /lark/event` — 飞书事件回调（在飞书开发者后台填该 URL）
- `GET  /api/me/krs?user_open_id=...` — 当前 KR 列表
- `POST /api/checkin` — 学习日志打卡
- `POST /api/kr/progress` — 更新 KR 完成度（100% 强制带证据）
- `GET  /api/me/advice?user_open_id=...` — 我的建议历史
- `GET  /health` — 健康检查

## 指令使用示例

```
锚定 产品经理            → 抓 50 条 JD，AI 生成 Objective 入库
拆解                     → 把 JD 拆成 KR + 自动创建每条 KR 的建议文档
本周                     → 列本周 P0/P1 KR，每条带打卡跳转
路径 数据分析能力        → 按需生成（或回显）路径文档链接
实习                     → Top 5 未查看实习
导出 周报 pdf            → 聚合 T4/T5/T6/T8 → 渲染 → 归档到云文档
```

## 后续工作

- **前端 H5 / PC 打卡页面**（详见 `OFFER预备役_前端约束文档.md`）
- 接入更多 MCP 平台（仅需在 T10 加配置即可）
- 拓展 T2 至 50+ 细分方向 & 配套路径文档库

> One More Thing — 任何不能在这句话里找到位置的新功能，都不做：
> **"把 JD 变成 OKR，每天打卡，AI 给建议，毕业拿 Offer。"**
