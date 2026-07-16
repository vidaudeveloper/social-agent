---
name: pipeline-orchestrator
description: "社媒内容管线编排器 — 用户说'跑一篇内容''今日选题''发一篇文章'时激活。加载此技能后按 Step 1→5 顺序执行完整管线。"
version: 1.1.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [pipeline, content-pipeline, create, orchestrator]
    related_skills:
      - create/video/remotion
      - create/video/creative-agent
      - create/image
      - publish/xiaohongshu
      - publish/youtube
      - publish/douyin
      - publish/zhihu
      - publish/tiktok
      - publish/reddit
      - publish/linkedin
      - publish/x
      - explore/xiaohongshu
      - explore/xiaohongshu/xhs-research
      - explore/youtube/yt-viral-research
      - review
      - humanizer
---

# 社媒内容管线编排器

**触发条件**：用户说「跑一篇内容」「今日选题」「发一篇文章」「帮我分发」「全自动流水线」  
**不要用于**：只写一篇稿不发布 / 只查热点不创作 / 纯翻译纯美工

**平台状态唯一来源**：`workspace/references/platform-status.md`（相对仓库根）

## Step 0: 初始化用户画像

读取 `workspace/user-profile.md`。不存在则一次性收集：

- 行业 / 平台开关 / API Key 是否已配置
- **内容语言偏好**：`zh-CN` | `en-US` | `bilingual`
- **发布语言策略**：全平台统一 | 按平台默认（国内中文、海外英文）

写入 `user-profile.md` 后再进入 Step 1。

## Step 1: 选题采集

搜索用户行业+兴趣领域的最近 24-48h 热点（**须多样化**）：

- web_search：不同切入角关键词
- 小红书：先读 `$HERMES_ROOT/知识库/xiaohongshu/LATEST.json` / `{slug}_创作参考.md`；过期或缺失再用 `search-feeds`，并经 `explore/xiaohongshu/xhs-research` 落盘
- **YouTube 英文赛道**：`explore/youtube/yt-viral-research`（TubePilot MCP → `youtube:explore`）或读已有 `$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json` 与 HTML 报告
- 知乎热榜（如已登录）
- 对照 `$HERMES_ROOT/文章/` 近 30 天标题去重

详细规则见 `workspace/references/topic-research-diversity.md`。

## Step 2: 适配矩阵（唯一人工确认点）

按用户画像预判适配矩阵，**等待用户确认**后进入 Step 3。

## Step 3: 母稿生产

按 Step 0 语言偏好决定母稿与改写语言。写入 `$HERMES_ROOT/文章/{平台}/{日期}_{slug}.md`

**小红书图文**：若存在 `$HERMES_ROOT/知识库/xiaohongshu/{slug}/` 下的 `{slug}_创作参考.md` 或 `LATEST.json` 指向的报告，优先作标题/结构/标签参考（见 `explore/xiaohongshu/xhs-research`）。若存在 `知识库/xiaohongshu/发布复盘/LATEST.json`（自己账号发后复盘），叠加读 `{date}_下次创作参考.md`（见 `analytics/xhs-post-analytics`）。

**YouTube 口播稿**：若存在 `$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json` 或 `{slug}_爆款报告.html`，优先作结构/钩子参考（见 `explore/youtube/yt-script-analyze`）。

## Step 4: 润色 + 排版 + 配图 + 视频（可选）

1. **humanizer** 去 AI 味
2. 小红书先 `npm run pipeline:xhs` → 失败再 tokenware（须用户确认）
3. 其他平台 → tokenware-image 封面
4. **视频类型**（用户需要成片时）：**必须先让用户二选一**，未选不准开工：
   - **Remotion 动画教程/动效片**：`create/remotion`（教程必载 `rules/tutorial-beat-video.md`，含两问确认）→ `$HERMES_ROOT/视频/remotion/{slug}/`
   - **Creative 创意商业片**：`create/creative-agent`
   - ~~TTS 黑底花字口播~~：**不再作为默认或推荐**；教程场景禁止用地路径

## Step 4.5: 发布前审核

`npm run review:lint -- --platform ... --file ...`；存在 error 阻断 Step 5。

## Step 4.9: 发布前确认（须绝对路径）

见 `workspace/references/publish-confirm-paths.md`，**等待用户确认**后再 Step 5。

## Step 5: 发布

发布前：

1. 对照 `platform-login-quickstart.md` 检查登录态
2. `npm run deps:check -- --platform ...`（缺依赖则停止，见 `dependency-policy.md`）

**√ 可自动发布**：知乎、小红书、Reddit、YouTube、TikTok、X、公众号（默认草稿）。  
**× 默认只出稿**：抖音、LinkedIn。

| 平台 | 命令 |
|------|------|
| 知乎 | `npm run zhihu:publish` |
| 小红书 | `python skills/publish/xiaohongshu/scripts/cli.py publish` |
| YouTube | `npm run youtube:publish` |
| TikTok | `npm run tiktok:publish` |
| Reddit | `npm run reddit:publish` |
| LinkedIn | `npm run linkedin:publish` |
| X | `npm run x:publish` |
| 公众号 | `npm run wechat:publish -- --file ... --mode draft_only` |

**规则**：失败不阻塞全局；间隔 5–10 分钟；缺依赖禁止找替代方案。

## 常见陷阱

1. 小红书配图：`pipeline:xhs` 前先 `tool:install`（按需）
2. 知乎不用 `#` 标题、`|` 表格
3. Reddit 失败先查界面是否为 English
4. X 账号限发属 ⚠️ 非 CLI 故障
