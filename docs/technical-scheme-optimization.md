# social-agent 优化技术方案（v1）

> **核心约束**：本 profile 是 VidAU 编排层，底层重度依赖第三方 CLI / MCP（social-auto-upload、baoyu-post-to-x、reddit-skills、youtube-analytics-cli、linkedin-cli 等）。
> **方案原则**：只补编排层与统一数据层，**不重写底层、不重复造轮子**。

## 0. 现状基线（关键发现）

逐文件核对后确认：4 个优化点中，大部分能力"代码已存在但未打通 / 未统一"。

| 能力 | 现状 | 缺口 |
|------|------|------|
| 抖音自动发布 | `scripts/run-douyin.mjs` 已有 login/check/upload；social-auto-upload 原生支持抖音 | 仅被标为 ×，未接入管线 |
| LinkedIn 自动发布 | `scripts/run-linkedin.mjs publish` 已存在（OAuth） | 仅被标为 ×，缺 token 刷新 |
| 跨平台数据 | 小红书已有 `report-schema.md`；YouTube/LinkedIn 已有 analytics CLI | 各自输出、标准不一、无聚合 |
| 风控规则 | `review:lint` 已存在 | 规则写死在代码，不可演进 |

真正缺的是三件事：**①统一引导入口**、**②跨平台归一化数据层**、**③可演进的规则数据源**。

## 1. 易用性 — 统一引导式 Setup（P0）

纯编排 + 报告，不碰底层。新增 `setup` 能力：

- `npm run setup:check`：遍历全部平台跑 `deps:check` + `*check-login`，输出**就绪矩阵**（✅/⚠️/❌ + 对应修复命令）。
- `npm run setup:install`：串行编排 `overseas:install` → `x:setup` → `reddit:setup` → `linkedin:setup` → `tool:install`，带进度与失败隔离（单平台失败不中断其余）。
- `npm run auth:status`：登录态健康巡检，缺 cookie 直接给出 `platform-login-quickstart.md` 深链。
- `user-profile.md` 增加 `setup_done` 标记，重跑跳过已就绪项。

**收益**：onboarding 从"读 5 篇文档手动敲命令"收敛为"两条命令 + 一份清单"。

## 2. 平台断点 — 渐进式灰度打通（P1）

不重写发布逻辑，只做"接入 + 灰度"：

- **抖音**：`run-douyin.mjs upload` 已可用 → 加发布前确认，在 `platform-status.md` 由 × 改为 ⚠️（自动发布但每次确认），稳定后转 √。
- **LinkedIn**：`run-linkedin.mjs publish` + 增加 OAuth token 自动刷新；同样先 ⚠️ 灰度。
- 在 `platform-status.md` 引入第三态 **⚠️（自动发布 + 每次确认）**，打破"能 / 不能"二值陷阱，同时降低封号风险。

## 3. 数据孤岛 — 统一数据层 + 跨平台看板（P0，最高杠杆）

新增 `skills/analytics/common/`：

- `schema.md`：归一化字段 `platform, post_id, published_at, impressions, engagements, saves, clicks, reach, like_rate`。
- 各平台 analytics CLI 增加 `--json` 出口，落盘到 `content/analytics/{date}_{platform}.json`（小红书已有 schema；YouTube/LinkedIn 已有 CLI，仅需加 JSON 出口，改动极小）。
- `npm run analytics:rollup`：聚合所有平台 JSON → `content/analytics/dashboard.json` + 渲染统一 HTML 看板（跨平台对比、单篇归因、趋势曲线）。

**收益**：反馈飞轮从"局部转"升级为"全局转"，并沉淀为可商业化的数据资产。

## 4. 风控静态 — 可演进规则层（P2）

- 新增 `knowledge/risk-signals.json` + `npm run review:harvest`：
  - harvest 扫描已发布作品表现（低曝光 / 限流信号），把"踩坑规律"写入 risk-signals，例如 `{"platform":"xiaohongshu","pattern":"标题含'最'","action":"warn"}`。
  - `review:lint` 启动时读取 risk-signals，动态提升对应警告级别。
- 轻量、零模型依赖，先把"人肉沉淀规则"自动化。

## 5. 分阶段路线图

| 阶段 | 周期 | 内容 | 风险 |
|------|------|------|------|
| Phase 1 | 1–2 周 | #3 统一数据层 + #1 `setup:check` | 低（纯编排 + 加 JSON 出口） |
| Phase 2 | 2–3 周 | #2 平台灰度打通（抖音 → LinkedIn） | 中（需真实账号验证发布稳定性） |
| Phase 3 | 持续 | #4 动态风控 + 飞轮闭环；扩展 analytics 覆盖（Reddit/TikTok/X） | 低 |

## 6. 风险与边界

- **平台 ToS 红线**：自动发布一律保留人工确认 / 草稿态，避免账号封禁——这是规模化天花板，也是合规底线。
- **不重复造底层**：所有能力优先复用已有 CLI / MCP，编排层只做"胶水 + 统一 + 演进"。
- **单一模型绑定**：`config.yaml` 强锁 tokenware（受现有 guardrails 约束）。若未来要降本 / 提稳，需预留 provider 抽象，且必须用户授权改动 config。
