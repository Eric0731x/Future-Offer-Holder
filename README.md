# OFFER 预备役

别人毕业才看 JD，你大一就在按 JD 攒经历。我们把目标岗位的招聘要求反向工程成大学四年的 OKR，让每一节课、每一个项目、每一次实习都精准服务于那份未来的 Offer。

**面向谁**：有目标感但缺路径的大一大二学生，包括想转行的大三生、双非想弯道超车的学生、考研留学两手准备的人。

**核心场景**：开学迷茫时不知道选什么课、刷什么项目、考什么证；想为目标岗位准备但找不到抓手；学了一堆东西却不知道是否走在正确的路上。

**核心功能**：飞书 Bot 六指令驱动——锚定目标岗位自动抓 JD、拆解成可执行的 KR、本周推送任务、路径提供学习资料、实习匹配练兵机会、导出一键生成 PDF/LaTeX 报告。配套独立 Web 端学习打卡，AI 基于打卡数据持续给出个性化建议，全程沉淀在飞书多维表格和云文档中。

> 把目标岗位的 JD 变成大学四年的 OKR，AI 给建议、Web 端打卡、自动生成 PDF/LaTeX 报告。

**当前状态**：业务后端（P0+P1+P2+P3 关键路径）✅ ｜ 前端 Web（PC + H5）✅

---

## 仓库结构

```
Future-Offer-Holder/
├── offer_reserve/             业务后端（Python / FastAPI）
│   ├── bot.py                 飞书事件回调（/lark/event）
│   ├── web_server.py          FastAPI 入口（聚合 bot + checkin api + scheduler）
│   ├── config.py              Pydantic Settings 配置加载
│   ├── lark/                  飞书 SDK 封装：client / bitable / docs / messaging
│   ├── ai/                    模型路由 + 三协议 provider + Prompt 模板
│   ├── mcp/                   招聘平台抓取适配（Boss / 实习僧 / 牛客 / 通用）
│   ├── commands/              六个核心指令（锚定 / 拆解 / 本周 / 路径 / 实习 / 导出）
│   ├── checkin/               学习日志 Web API + AI 建议生成 + APScheduler
│   ├── export/                报告导出（聚合数据 → HTML/PDF 与 LaTeX）
│   ├── templates/             PDF / LaTeX 模板
│   └── scripts/               T2 选项库种子 + 指令冒烟
│
└── frontend/                  前端（React 18 + TypeScript + Vite）
    └── src/
        ├── styles/tokens.css  设计 token（亮/暗主题、字体、圆角、阴影、glass）
        ├── components/
        │   ├── ui.tsx         Icon · Ring · Bar · Pill · Avatar · Streak · Stat · …
        │   └── layout.tsx     TopNav · MobileNav · BottomTab · FAB · PageFrame
        ├── pages/
        │   ├── Home.tsx       首页（PC 杂志风 + Mobile 紧凑）
        │   ├── Checkin.tsx    7 步骤打卡 + CheckinSuccess 全屏叠层
        │   ├── KR.tsx         KR 看板（状态边框色）
        │   ├── Advice.tsx     AI 建议中心（特色卡 + 历史 Tab）
        │   └── Internship.tsx 实习推荐（Ring 匹配分）
        ├── App.tsx            React Router v6 + 移动/PC 响应式
        ├── main.tsx           入口（BrowserRouter）
        ├── data.ts            类型化 mock 数据（三档学年人设）
        └── types.ts           共享类型（PageProps / CheckinResult）
```

---

## 关键设计约束（来自产品文档）

1. **永远只有 6 个指令**：锚定 / 拆解 / 本周 / 路径 / 实习 / 导出。
2. **AI 是教练不是判官**：Prompt 中禁止判定/评级类用语，输出建议而非定论。
3. **建议正文存云文档，元数据存多维表格**：T8 只保元数据；正文按时间倒序追加到每个 KR 唯一的建议文档。
4. **管理员后台 = 飞书表格**：T9/T10 完全由表格驱动，热加载（默认 60s）。
5. **模型完全自定义**：不内置任何 Key，全由 T9 加载，失败自动按 priority 降级。
6. **MCP 只读**：不模拟登录、不写入第三方平台；QPS ≤ 1；3 次失败后跳过。
7. **方向只能选不能输**：用户必须从 T2 选择，命令层做严格校验。
8. **KR 100% 必带证据**：Web API 在 `/api/kr/progress` 层强约束。
9. **前端组件不可改**：UI 取自 Claude Design 原型，每个组件与视觉效果均与原型完全一致；后端按 UI 需求适配，业务能力 100% 保留。

---

## 快速开始

### 后端

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
# 默认监听 http://localhost:8000
```

服务暴露：
- `POST /lark/event` — 飞书事件回调（在飞书开发者后台填该 URL）
- `GET  /api/me/krs?user_open_id=...` — 当前 KR 列表
- `POST /api/checkin` — 学习日志打卡
- `POST /api/kr/progress` — 更新 KR 完成度（100% 强制带证据）
- `GET  /api/me/advice?user_open_id=...` — 我的建议历史
- `GET  /health` — 健康检查

### 前端

```bash
cd frontend
npm install            # 安装依赖
npm run dev            # 启动开发服务器 http://localhost:5173
                       # /api 与 /lark 已代理到后端 :8000
npm run build          # 生产构建（输出到 frontend/dist/）
```

技术栈：React 18 · TypeScript · Vite 5 · React Router v6 · Zustand · Framer Motion

构建产物体积：**216 kB JS / 7 kB CSS**（gzip 后 67 kB / 2 kB）。

---

## 指令使用示例

```
锚定 产品经理            → 抓 50 条 JD，AI 生成 Objective 入库
拆解                     → 把 JD 拆成 KR + 自动创建每条 KR 的建议文档
本周                     → 列本周 P0/P1 KR，每条带打卡跳转
路径 数据分析能力        → 按需生成（或回显）路径文档链接
实习                     → Top 5 未查看实习
导出 周报 pdf            → 聚合 T4/T5/T6/T8 → 渲染 → 归档到云文档
```

---

## 前端页面一览

| 路由 | 页面 | 形态 |
|---|---|---|
| `/` | 首页 | PC 杂志风 Hero + 260px OKR Ring + 暗色任务带 + 建议/实习；Mobile 暗色 OKR 卡 + 竖排 KR 列表 |
| `/checkin` | 打卡 | 7 步骤表单（KR 选择 → 投入时长 → 自由文本 + AI 润色 → 进度推进 → 问题描述 → 证据上传 → 心情 + 自评）+ 粘性提交栏 + 成功叠层动画 |
| `/kr` | KR 看板 | 优先级 + 完成状态过滤；卡片以状态色描边（done/warn/bad） |
| `/advice` | AI 建议中心 | 暗色特色卡片（3 列 你做得好/值得思考/下一步）+ 历史 Tab（日/周/月/学期/KR） |
| `/internship` | 实习推荐 | 卡片列表 + Ring 匹配分 + AI 推荐理由 + 忽略/查看 JD |

---

## 后续工作

- 接入更多 MCP 平台（仅需在 T10 加配置即可）
- 拓展 T2 至 50+ 细分方向 & 配套路径文档库
- 前端 ↔ 后端 真实数据打通（当前页面使用 `data.ts` 中的 mock 数据，可逐路替换为 `/api/*` 调用）

---

> One More Thing — 任何不能在这句话里找到位置的新功能，都不做：
> **"把 JD 变成 OKR，每天打卡，AI 给建议，毕业拿 Offer。"**
