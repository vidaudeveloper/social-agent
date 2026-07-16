# 技能意图路由表（唯一契约）

> **Agent 每次接到平台相关请求时必须先读本表**，识别一级意图 → 抽取参数 → 加载**最小必要叶子 skill** → 仅按该 skill 允许的 CLI 执行。  
> 五层 `explore → create → review → publish → analytics` 是**能力层**，不是每次都要跑完的固定流程。

相关入口：[`SOUL.md`](../../SOUL.md) · [`skills/README.md`](../../skills/README.md) · [`pipeline-orchestrator`](../../skills/create/pipeline-orchestrator/SKILL.md)

---

## Skill Gate（强制）

1. **先路由，再动手**：未识别意图、未加载目标叶子 skill 前，禁止写临时脚本、裸调底层 CLI、用 MCP/浏览器替代规定实现。
2. **无匹配则停手**：路由表与已安装 skill 都对不上时，报告能力缺口（建议新增/扩展 skill），禁止即兴实现。
3. **命令来自 skill**：编排器只点名 skill；具体 `npm run` / `python cli.py` 以叶子 `SKILL.md` 为准。
4. **单平台优先**：用户只提一个平台时，永远走该平台叶子 skill，**不要**默认拉起完整 `pipeline-orchestrator`。

---

## 一级意图（四类）

| 意图 ID | 含义 | 默认入口 skill | 禁止默认加载 |
|---------|------|----------------|--------------|
| `content-pipeline` | 从选题/写稿到一个或多个平台发布（完整生产） | `pipeline-orchestrator` | 单独 analytics；在未确认平台前不要直接 publish |
| `publish-single` | 已有成稿/媒体，只发布**一个**指定平台 | `{code}-publish`（如 `xhs-publish`） | `pipeline-orchestrator`；选题/explore；无关平台 auth |
| `analytics-post` | 查**已发布**作品/频道数据（发后复盘） | `{code}-*-analytics`（如 `yt-post-analytics`） | create / publish / 发前 explore research |
| `focused-task` | 单点：登录、调研、配图、审核、成片等 | 对应叶子（见下表） | 完整管线；除非用户明确「接着发布」 |

### 多平台判定（进 `content-pipeline`）

**仅当**满足任一条件才进完整编排：

- 用户明确说「多个平台 / 全平台 / 分发 / 矩阵 / 一起发」
- 用户在同一请求里列出 **≥2** 个平台名
- 用户说「跑一篇内容 / 今日选题 / 全自动流水线」且未限定单平台

**否则**：单平台发布 → `publish-single`；只分析数据 → `analytics-post`；只做一步 → `focused-task`。

---

## 意图 → 技能映射

### A. `content-pipeline`

| 项 | 内容 |
|----|------|
| **必填参数** | 无硬性；缺画像则 Step 0 收集；缺平台偏好则输出矩阵等用户确认 |
| **可选参数** | 话题、语言偏好、是否成片、目标平台列表 |
| **允许技能** | `pipeline-orchestrator`；各阶段再 `skill_view` 叶子（research / remotion / review / `{code}-publish` 等） |
| **禁止** | 跳过意图判定直接 `npm run`；未加载叶子就发布；缺依赖找替代 |
| **典型例句** | 「今日选题发一篇」「帮我分发到各平台」「跑完整流水线」「这篇稿多平台矩阵发」 |

### B. `publish-single`

| 平台 | 入口 skill | 包装命令（以叶子 SKILL 为准） | 常见必填 |
|------|------------|------------------------------|----------|
| 小红书 | `xhs-publish` | 叶子内 `python …/cli.py` | 文稿/图/视频路径；发布前确认 |
| YouTube | `yt-publish` | `npm run youtube:publish` | MP4 + 标题；登录态 |
| 抖音 | `dy-publish` | `npm run douyin:upload` | MP4 + 标题 |
| TikTok | `tt-publish` | `npm run tiktok:publish` | 视频路径 |
| X | `x-publish` | `npm run x:publish` | 文案/文件；是否 `--submit` |
| Reddit | `rd-publish` | `npm run reddit:publish` | 文稿；界面 English |
| 知乎 | `zh-publish` | `npm run zhihu:publish` | 文稿路径 |
| 公众号 | `wechat-publish` | `npm run wechat:publish` | 文稿；默认草稿 |
| LinkedIn | `li-publish` | `npm run linkedin:publish` | 文稿；平台状态多为 × |

| 项 | 内容 |
|----|------|
| **禁止技能** | `pipeline-orchestrator`（除非用户改口要全流程）；其它平台的 publish/auth |
| **可选前置** | 用户要求时再加载 `review`；登录问题再加载 `{code}-auth` |
| **典型例句** | 「只发小红书」「把这个 MP4 传到 YouTube」「发这条推」「公众号进草稿」 |

### C. `analytics-post`

| 平台 | 入口 skill | 包装命令 | 与发前 explore 分流 |
|------|------------|----------|---------------------|
| YouTube | `yt-post-analytics` | `npm run youtube:stats` | 发前爆款 → `yt-viral-research` / `yt-viral-discover` |
| 小红书 | `xhs-post-analytics` | `npm run xhs:stats` | 发前竞品 → `xhs-research` |
| LinkedIn | `li-analytics` | `npm run linkedin:stats` | — |

| 项 | 内容 |
|----|------|
| **必填/可选** | 平台；可选：时间范围、视频/笔记 ID、是否落盘 HTML |
| **禁止** | 创作/发布 skill；裸 `npx youtube-analytics-cli` |
| **典型例句** | 「看下 YouTube 上周播放」「小红书发后复盘」「频道观看时长报表」 |

### D. `focused-task`（按关键词）

| 子类 | 入口 skill | 不要用于 / 交给 |
|------|------------|-----------------|
| 登录/鉴权 | `{code}-auth`（如 `xhs-auth`、`yt-auth`） | 不要顺手发布 |
| 小红书竞品/热点落盘 | `xhs-research` | 自家发后数据 → `xhs-post-analytics` |
| YouTube 爆款发现（Top/打分） | `yt-viral-discover` | 要完整沉淀报告 → `yt-viral-research`；自家频道数据 → `yt-post-analytics` |
| YouTube 爆款调研编排 | `yt-viral-research` | 只要列表打分 → `yt-viral-discover` |
| 小红书模板配图 | `xhs-card-render` | AI 生图降级 → `img-tokenware`（须确认） |
| 其它平台/通用生图 | `img-tokenware` | 小红书优先 `xhs-card-render` |
| 发布前格式审核 | `review` | 登录检查 / 实际发布 |
| Remotion 教程动效 | `remotion` | 商业创意片 → `creative-agent` |
| 商业创意片 | `creative-agent` | 教程结构片 → `remotion` |

---

## 易混淆对（粗召回后必须精排）

| 用户说法倾向 | 选 | 不选 |
|--------------|----|------|
| 「YouTube 爆款 / Top 视频 / 赛道热门」且只要列表分级 | `yt-viral-discover` | `yt-post-analytics` |
| 「分析爆款并沉淀 / 出报告 / 金句库」 | `yt-viral-research` | 仅 discover；勿当发后 analytics |
| 「我的频道播放 / Analytics / 观看时长」 | `yt-post-analytics` | `yt-viral-*` |
| 「小红书竞品 / 热点 / 创作参考」 | `xhs-research` | `xhs-post-analytics` |
| 「我发的笔记数据 / 创作者中心导出」 | `xhs-post-analytics` | `xhs-research` |
| 「小红书配图 / 卡片」 | `xhs-card-render` | 起手 `img-tokenware` |
| 「生图 / 封面（非小红书主路径）」 | `img-tokenware` | 替代已成功的 pipeline:xhs |
| 「只发某平台」 | `{code}-publish` | `pipeline-orchestrator` |
| 「多平台 / 流水线」 | `pipeline-orchestrator` | 只加载一个 publish 就结束 |

---

## Agent 决策清单（每次请求）

```text
1. 读本表，标出意图 ID（四选一；模糊则先问清平台/是否多平台/是否已有素材）
2. 抽取参数；缺必填则追问，不猜测发布
3. skill_view(目标叶子) —— 可多步，但每步最小集合
4. 仅执行该 SKILL 允许的命令
5. 汇报：意图 | 已加载 skill | 结果；卡住给 A/B
```

评测：[`tests/skill-routing/cases.yaml`](../../tests/skill-routing/cases.yaml) · [`skill-routing-eval`](../../skills/review/skill-routing-eval/SKILL.md)
