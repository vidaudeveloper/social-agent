---
name: pipeline-orchestrator
description: |
  多平台内容生产编排器（content-pipeline）。从选题/写稿到一个或多个平台发布。
  触发：「跑一篇内容」「今日选题」「帮我分发」「全自动流水线」「多平台矩阵」「列出 ≥2 个平台一起发」。
  不要用于：只发单平台已有稿（用 {code}-publish）；只查发后数据（用 *-analytics）；只调研/配图/审核/登录（用对应叶子）。
version: 1.2.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [pipeline, content-pipeline, create, orchestrator]
    related_skills:
      - create/video/remotion
      - create/video/creative-agent
      - create/image/skills/xhs-card-render
      - create/image/skills/img-tokenware
      - review
      - explore/xiaohongshu/xhs-research
      - explore/youtube/yt-viral-research
      - analytics/xhs-post-analytics
      - analytics/yt-post-analytics
---

# 多平台内容生产编排器

**路由契约**：先读 [`workspace/references/skill-routing.md`](../../../workspace/references/skill-routing.md)。  
本技能**仅**对应意图 `content-pipeline`。

**触发条件**：用户说「跑一篇内容」「今日选题」「发一篇文章」「帮我分发」「全自动流水线」，或明确多平台 / 矩阵 / 列出 ≥2 平台。  
**不要用于**：

- 只发布**一个**已有成稿/视频 → `{code}-publish`（如 `xhs-publish`、`yt-publish`）
- 只查发后数据 → `yt-post-analytics` / `xhs-post-analytics` / `li-analytics`
- 只写稿不发布 / 只查热点不创作 / 纯翻译纯美工 → 对应 `focused-task` 叶子

**平台状态唯一来源**：`workspace/references/platform-status.md`（相对仓库根）

## 入口：意图复核

加载本技能后**先确认**：

1. 用户是否真要完整生产（选题→发布），而非单点 publish/analytics
2. 若用户其实只要单平台发布或数据分析 → **停止本编排**，改 `skill_view` 正确叶子并告知用户

确认后再进入 Step 0。

## Skill Gate（编排内）

每一步需要平台能力时：

1. `skill_view(<叶子 name>)`
2. **仅**执行该叶子 `SKILL.md` 允许的命令
3. 禁止在未加载叶子时直接抄下方历史命令表凑合执行；下表仅作索引，以叶子为准

## Step 0: 初始化用户画像

读取仓库根目录 `user-profile.md`（与 [`SOUL.md`](../../../SOUL.md) 一致）。不存在则一次性收集：

- 行业 / 平台开关 / API Key 是否已配置
- **内容语言偏好**：`zh-CN` | `en-US` | `bilingual`
- **发布语言策略**：全平台统一 | 按平台默认（国内中文、海外英文）

写入 `user-profile.md`（仓库根）后再进入 Step 1。

## Step 1: 选题采集

搜索用户行业+兴趣领域的最近 24-48h 热点（**须多样化**）：

- web_search：不同切入角关键词
- 小红书：先读 `$HERMES_ROOT/知识库/xiaohongshu/LATEST.json` / `{slug}_创作参考.md`；过期或缺失再经 **`skill_view("xhs-research")`** 落盘
- **YouTube 英文赛道**：**`skill_view("yt-viral-research")`**，或读已有 `$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json` 与 HTML 报告
- 知乎热榜（如已登录）
- 对照 `$HERMES_ROOT/文章/` 近 30 天标题去重

详细规则见 `workspace/references/topic-research-diversity.md`。

## Step 2: 适配矩阵（唯一人工确认点）

按用户画像预判适配矩阵，**等待用户确认**后进入 Step 3。

## Step 3: 母稿生产

按 Step 0 语言偏好决定母稿与改写语言。写入 `$HERMES_ROOT/文章/{平台}/{日期}_{slug}.md`

**小红书图文**：若存在创作参考或 `LATEST.json`，优先作标题/结构/标签参考（见 `xhs-research`）。若存在发后复盘 `下次创作参考.md`，叠加读取（见 `xhs-post-analytics`）。

**YouTube 口播稿**：若存在 `scripts_raw.json` 或爆款报告，优先作结构/钩子参考（见 `yt-script-analyze` / `yt-viral-research`）。

## Step 4: 润色 + 排版 + 配图 + 视频（可选）

1. **humanizer** 去 AI 味
2. 小红书：**`skill_view("xhs-card-render")`** → 按该技能执行 `pipeline:xhs`；失败再 **`skill_view("img-tokenware")`**（须用户确认）
3. 其他平台 → **`skill_view("img-tokenware")`**
4. **视频类型**（用户需要成片时）：**必须先让用户二选一**，未选不准开工：
   - **Remotion 动画教程/动效片**：**`skill_view("remotion")`**（教程必载 `rules/tutorial-beat-video.md`）
   - **Creative 创意商业片**：**`skill_view("creative-agent")`**
   - ~~TTS 黑底花字口播~~：不再作为默认或推荐

## Step 4.5: 发布前审核

**`skill_view("review")`** → 按该技能执行 `npm run review:lint`；存在 error 阻断 Step 5。

## Step 4.9: 发布前确认（须绝对路径）

见 `workspace/references/publish-confirm-paths.md`，**等待用户确认**后再 Step 5。

## Step 5: 发布

发布前：

1. 对照 `platform-login-quickstart.md`；登录问题再 **`skill_view("{code}-auth")`**
2. `npm run deps:check -- --platform ...`（缺依赖则停止，见 `dependency-policy.md`）
3. 每个平台：**`skill_view("{code}-publish")`** → 仅用该叶子允许的命令

**√ 可自动发布**：知乎、小红书、Reddit、YouTube、TikTok、X、公众号（默认草稿）。  
**× 默认只出稿**：抖音、LinkedIn。

### 叶子索引（执行以各 SKILL 为准）

| 平台 | 先加载 | 包装入口（参考） |
|------|--------|------------------|
| 知乎 | `zh-publish` | `npm run zhihu:publish` |
| 小红书 | `xhs-publish` | 叶子内 `python …/cli.py` |
| YouTube | `yt-publish` | `npm run youtube:publish` |
| TikTok | `tt-publish` | `npm run tiktok:publish` |
| Reddit | `rd-publish` | `npm run reddit:publish` |
| LinkedIn | `li-publish` | `npm run linkedin:publish` |
| X | `x-publish` | `npm run x:publish` |
| 公众号 | `wechat-publish` | `npm run wechat:publish -- --mode draft_only` |

**规则**：失败不阻塞全局；间隔 5–10 分钟；缺依赖禁止找替代方案；禁止未加载叶子就裸调底层 CLI。

## 常见陷阱

1. 小红书配图：先 `xhs-card-render` / `tool:install`（按需），勿起手 tokenware
2. 知乎不用 `#` 标题、`|` 表格
3. Reddit 失败先查界面是否为 English
4. X 账号限发属 ⚠️ 非 CLI 故障
5. 用户说「只发小红书」却加载了本编排器 → 应改道 `xhs-publish`
