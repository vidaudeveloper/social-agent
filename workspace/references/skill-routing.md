# 技能意图路由表（唯一契约）

> **Agent 每次接到请求时必须先读本表**，按分层模型识别路由结果 → 加载**最小必要叶子 skill** → 仅按该 skill 允许的 CLI 执行。  
> 五层 `explore → create → review → publish → analytics` 是**能力目录层**；本表的原子意图是**业务路由层**。二者正交，不是每次都要跑完五层。

相关入口：[`SOUL.md`](../../SOUL.md) · [`skills/README.md`](../../skills/README.md) · [`pipeline-orchestrator`](../../skills/create/pipeline-orchestrator/SKILL.md)

---

## Skill Gate（强制）

1. **先路由，再动手**：未识别路由状态、未加载目标叶子 skill 前，禁止写临时脚本、裸调底层 CLI、用 MCP/浏览器替代规定实现。
2. **无匹配则停手**：`route_status` 为 `capability-gap` / `out-of-scope` 时报告缺口或边界，禁止即兴实现。
3. **命令来自 skill**：编排器只点名 skill；具体 `npm run` / `python cli.py` 以叶子 `SKILL.md` 为准。
4. **单平台 / 已有素材优先**：已有成稿只发布 → `publish`；不要因「列出 ≥2 平台」就默认拉起 `pipeline-orchestrator`。
5. **预加载 Skill 不是意图**：CLI / Hub 预加载的 skill 只能提高召回权重，不能覆盖用户当前明确指令。

---

## 分层路由模型

### 0. 请求域 `request_domain`

| 域 | 含义 | 处理 |
|----|------|------|
| `social-operation` | 社媒调研/创作/审核/发布/登录/数据/互动 | 进入原子意图路由 |
| `meta-workspace` | 对话归档、路由评测、项目说明、配置检查 | 有匹配 skill 则调用；文档整理可用基础文件能力；改配置/装依赖须用户授权 |
| `out-of-scope` | 与社媒运营及项目维护无关 | 简短说明边界；**不召回**社媒 skill |

### 1. 路由状态 `route_status`

| 状态 | 何时 | 行为 |
|------|------|------|
| `matched` | 意图与 skill 明确匹配 | 生成执行链并执行 |
| `needs-clarification` | 可能匹配但缺平台/素材/对象 | 只追问最少问题，**不提前执行** |
| `capability-gap` | 意图清楚但无对应 skill（含 schedule 未实现） | 报告缺口 + 最接近能力；未经确认不用相邻 skill 代替 |
| `partial-support` | 复合请求只有部分可做 | 列出可执行与缺失环节，等用户确认 |
| `out-of-scope` | 请求域外 | 不调用社媒 skill |

### 2. 原子意图（七类）

| 意图 ID | 含义 | 默认入口 | 禁止默认 |
|---------|------|----------|----------|
| `research` | 发前调研：热点、竞品、爆款、选题、字幕/脚本拆解 | `xhs-research` / `yt-viral-*` / `xhs-explore` | 自有账号 analytics；publish |
| `create` | 文案、配图、视频、配音、平台改写；**不默认发布** | `xhs-card-render` / `img-tokenware` / `remotion` / `creative-agent` | publish；完整管线（除非用户明确接着发） |
| `review` | 格式、合规、标题、发布前检查 | `review` | auth；直接 publish |
| `publish` | 已有素材，发布到一或多个平台 | `{code}-publish` | `pipeline-orchestrator`；发前 research（除非用户要求） |
| `auth` | 登录、扫码、Cookie、OAuth、登录态检查 | `{code}-auth` | 顺手 publish |
| `analytics` | 自有账号 / 已发布作品发后复盘 | `*-post-analytics` / `li-analytics` | 发前 viral research；create/publish |
| `interact` | 评论、回复、点赞、收藏等互动 | `xhs-interact` | 其它平台 interact（缺口） |

### 3. 流程范围 `workflow_scope`

| 值 | 含义 |
|----|------|
| `atomic` | 单步原子意图 |
| `chain` | 有序多步（如 `review → publish`） |
| `full-workflow` | 用户明确要求从选题/调研到发布的一条龙；展开为 `research → create → review → publish` |

**`full-workflow` 触发（须明确）**：

- 「从选题到发布」「一条龙」「完整流水线」「全自动跑一篇并发出去」
- 单平台也可：如「只做小红书，但从选题、配图、审核一直做到发布」

**不得因**「列出 ≥2 平台」或「同时发」自动进 `full-workflow`——已有稿多平台分发仍是 `publish`。

入口 skill：`pipeline-orchestrator`（仅 `workflow_scope: full-workflow`）。

### 4. 自动化包装 `schedule`（当前 capability-gap）

跨业务包装层，不替代原子意图。例：

- 「每天 9 点生成小红书选题」→ `schedule(research)`
- 「每周一拉 YouTube 数据」→ `schedule(analytics)`
- 「明晚 8 点发这篇稿」→ `schedule(publish)`

```yaml
automation:
  action: create | list | update | pause | resume | delete | run-now
  schedule_type: once | recurring
  expression: null
  timezone: Asia/Shanghai   # 默认北京时间
  target_chain: []
  start_at: null
  end_at: null
  confirmation_required: true
```

**当前阶段**：只识别并抽取参数，统一 `route_status: capability-gap`（调度器未实现）；禁止假装任务已创建。缺时间/平台/素材/任务 ID 时先追问。定时发布仍须遵守发布确认与登录门禁。

### 5. 执行门禁 `gates`

| Gate | 何时 |
|------|------|
| `dependency_check` | 执行前缺依赖 |
| `auth_if_required` | 登录失效或用户要求登录；**不抢占** primary（如发布仍是 `publish`） |
| `review_if_required` | 用户要求审核，或 full-workflow 发布前 |
| `user_confirmation` | 真实发布 / 正式群发 / 批量互动 |

---

## 路由输出结构（Agent 每次汇报）

```yaml
route_status: matched | needs-clarification | capability-gap | partial-support | out-of-scope
request_domain: social-operation | meta-workspace | out-of-scope
primary_intent: research | create | review | publish | auth | analytics | interact | null
intent_chain: []          # 有序，如 [review, publish]
workflow_scope: atomic | chain | full-workflow
automation: null | { ... }
gates: []
platforms: []
material_ready: true | false | unknown
content_owner: self | competitor | unknown
stage: pre_publish | post_publish | unknown
output_constraints: {}    # 路径、格式等；不是业务意图
language_style: null
candidate_intents: []
missing_capabilities: []
needs_clarification: []
safe_next_actions: []
```

---

## 意图 → 技能映射

### `research`

| Skill | 说明 |
|-------|------|
| `xhs-research` | 小红书竞品/热点落盘 + 创作参考 |
| `xhs-explore` | 小红书拉数，不强制落盘 |
| `yt-viral-discover` | YouTube Top/打分列表 |
| `yt-viral-research` | YouTube 完整调研报告 + 金句库 |
| `yt-transcript-extract` / `yt-script-analyze` | 字幕 / crv 深拆（常收口到 research） |

典型：「赛道爆款」「竞品怎么写」「五个热点选题」「写稿前 YouTube 调研」。  
禁止：自家频道播放数据 → `analytics`。

### `create`

| Skill | 说明 |
|-------|------|
| `xhs-card-render` | 小红书模板卡片 |
| `img-tokenware` | 通用 AI 生图 |
| `remotion` | 教程/动效视频 |
| `creative-agent` | 商业创意片 |
| （隐式）写稿 | 无独立文案叶子时：只写稿不发布 → `create`；若用户明确要到发布 → `full-workflow` |

典型：「写一篇种草笔记先别发」「配封面」「Remotion 教程」。  
「写完直接发」→ `intent_chain: [create, publish]` 或确认后 `full-workflow`。

### `review`

入口：`review`。典型：「发布前过一遍稿」「检查标题格式」。  
「审核后发布」→ `primary_intent: publish`，`intent_chain: [review, publish]`，review 不抢占最终发布意图。

### `publish`

| 平台 | Skill |
|------|-------|
| 小红书 | `xhs-publish` |
| YouTube | `yt-publish`（上传辅助 `yt-upload`） |
| 抖音 / TikTok / X / Reddit / 知乎 / 公众号 / LinkedIn | `dy-publish` / `tt-publish` / `x-publish` / `rd-publish` / `zh-publish` / `wechat-publish` / `li-publish` |

典型：「只发小红书」「稿子有了同时发知乎和公众号」「MP4 上传 YouTube」。  
禁止：无稿从零创作发布 → 应 `full-workflow` 或先 `create`。

### `auth`

各 `{code}-auth`。典型：「登录小红书扫码」「检查 Cookie」。  
「登录后发帖」→ `primary_intent: publish` + gate `auth_if_required`。

### `analytics`

| Skill | 平台 |
|-------|------|
| `yt-post-analytics` | YouTube |
| `xhs-post-analytics` | 小红书 |
| `li-analytics` | LinkedIn |

典型：「我频道上周播放」「发后复盘」。竞品爆款 → `research`。

### `interact`

仅 `xhs-interact`。其它平台 → `capability-gap`。

### 复合 / 特殊入口

| Skill | 路由 |
|-------|------|
| `pipeline-orchestrator` | 仅 `workflow_scope: full-workflow` |
| `yt-pipeline` | YouTube 单平台一条龙；属 `full-workflow` 子入口或 create+publish 链 |
| `xhs-content-ops` | 小红书调研+发布+互动组合；复合编排，须在契约中显式点名 |
| `skill-routing-eval` | `meta-workspace`：路由回归评测 |

---

## 易混淆对（粗召回后必须精排）

| 用户说法倾向 | 选 | 不选 |
|--------------|----|------|
| YouTube 爆款 Top / 只要列表 | `yt-viral-discover` | `yt-post-analytics` |
| 爆款报告 / 金句库 / 种子调研 | `yt-viral-research` | 仅 discover；勿当 analytics |
| 我的频道播放 / 观看时长 | `yt-post-analytics` | `yt-viral-*` |
| 小红书竞品 / 热点 / 创作参考 | `xhs-research` | `xhs-post-analytics` |
| 我发的笔记数据 | `xhs-post-analytics` | `xhs-research` |
| 小红书配图 / 卡片 | `xhs-card-render` | 起手 `img-tokenware` |
| 只发某平台（已有素材） | `{code}-publish` | `pipeline-orchestrator` |
| 从选题做到发布 | `pipeline-orchestrator` | 只加载一个 publish |
| 已有稿同时发两平台 | `publish` 多步 | `full-workflow` |
| 只写稿先别发 | `create` | `full-workflow` |
| 审核后发布 | `review → publish` | 单独 review 结束或默认 full-workflow |
| 每天定时生成选题 | `schedule(research)` → gap | 假装已创建 cron |

---

## Agent 决策清单（每次请求）

```text
1. 识别 request_domain（social / meta / out-of-scope）
2. 是否 schedule？抽取 automation；调度器未实现 → capability-gap（可先追问缺参）
3. 识别原子意图 + workflow_scope + intent_chain + gates
4. route_status：信息不足追问；能力缺口停手；部分支持等确认
5. skill_view(最小叶子集)；仅执行 SKILL 允许命令
6. 汇报：route_status | domain | primary | chain | automation | skills | 结果
```

---

## 上下文读取顺序

**禁止**把所有任务套成「Profile → Status → 知识库 → 爬数 → 落盘」。  
**统一前置**：本表路由 → `skill_view` 最小叶子。

| 意图 / 范围 | 读取顺序 | 禁止默认 |
|-------------|----------|----------|
| `full-workflow` | 编排器 → `user-profile.md` → `platform-status.md` → 知识库/复盘 → 叶子 reference → 必要时实时数据 → review → 发布确认 | 无关平台；未确认就发布 |
| `publish` | `{code}-publish` → 素材路径 → 必要时 platform-status → auth 仅报错或用户要求时 | 知识库；发前 explore |
| `analytics` | analytics 叶子 → 账号/时间范围 → CLI → 落盘 | create/publish；发前 research |
| `research` | 对应叶子 → 已有报告优先 → 7 天内同主题默认不重复全量爬 | 完整管线；未经要求的 publish |
| `create` / `review` / `auth` / `interact` | 对应叶子 → **仅**该叶子写明的 reference | 完整管线；无关爬数 |

**用户画像路径（唯一）**：仓库根 [`user-profile.md`](../user-profile.md)。

---

## 增长场景（路线图对照，非一级意图）

下列为**产品增长场景**，映射到原子意图或 capability gap（勿与七类原子意图同名混淆）：

| 增长场景 | 典型说法 | 现有入口 | 缺口 |
|----------|----------|----------|------|
| 内容创作 | 写一篇/生成文案 | `create` / `full-workflow` | — |
| 选题灵感 | 热点/选题 | `research` | 独立选题 skill |
| 规划排期 | 内容日历 | — | capability gap |
| 多平台改写 | 改成小红书版 | `create`（编排器部分） | `{code}-adapt` |
| 数据复盘 | 复盘/月报 | `analytics` | dy/tt/x/zh 等 |
| 账号定位 | 人设/品牌 | Step 0 画像 | `position-persona` |
| 互动社群 | 回复评论 | `interact` | 其它平台 |
| 活动增长 | 涨粉活动 | — | capability gap |
| 定时自动化 | 每天/每周执行 | `schedule` 识别 | **调度器未实现** |

---

评测：[`tests/skill-routing/cases.yaml`](../../tests/skill-routing/cases.yaml) · [`skill-routing-eval`](../../skills/review/skill-routing-eval/SKILL.md)
