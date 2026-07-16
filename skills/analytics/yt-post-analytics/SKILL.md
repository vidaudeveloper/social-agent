---
name: yt-post-analytics
description: |
  YouTube 发后频道/作品数据分析（analytics）。基于 youtube-analytics-cli 拉公开统计或 Analytics 报表并落盘。
  触发：「频道播放」「观看时长」「YouTube Analytics」「发后复盘」「上周数据」。
  口语：我的频道表现、视频播放量、自家频道复盘、Analytics 报表。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, analytics, post-publish, report]
    related_skills:
      - publish/youtube/skills/yt-publish
      - explore/youtube/yt-viral-research
      - explore/youtube/yt-viral-discover
      - create/pipeline-orchestrator
---

# YouTube 发布后数据分析（yt-post-analytics）

发**之后**看频道与作品表现（官方 Data / Analytics API）。  
（发**之前**的爆款调研请用 `yt-viral-research` 或列表发现用 `yt-viral-discover`。）

## When to use

- 用户要查**自己已发布**频道/视频的播放、观看时长、互动、Analytics 报表
- 需要落盘 HTML/JSON 复盘，或回答「上周表现怎么样」
- 典型说法：「YouTube 频道数据」「观看时长报表」「发后复盘」「Analytics 报表」

## When not to use

- 竞品/赛道爆款发现 → **`yt-viral-discover`** / **`yt-viral-research`**
- 上传/发布新视频 → **`yt-publish`**
- 从选题写到多平台发布 → **`pipeline-orchestrator`**

上游 CLI：[Bin-Huang/youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli)

## 技能边界

- **唯一执行方式**：`npm run youtube:stats -- <子命令…>`（包装 `scripts/run-youtube-analytics.mjs`）
- **落盘 HTML**：默认用 `npm run youtube:stats -- archive`（禁止只聊不落盘）
- 禁止裸 `npx youtube-analytics-cli` 绕过包装（凭据加载与 deps 检查由包装脚本负责）
- 缺依赖时：提示 `npm run youtube:stats-setup` 后**停止**，等用户确认再装
- 输出为 JSON；Agent 整理结论时勿复述密钥，勿把完整凭据路径内容贴进对话

## 认证速查

| 场景 | 需要 |
|------|------|
| `videos` / `channels <id>` | `YOUTUBE_API_KEY` |
| `channels`（无 ID）/ `report` / `groups` | OAuth：`YOUTUBE_CLIENT_ID` + `SECRET` + `REFRESH_TOKEN` |

详见 [`references/setup.md`](references/setup.md)。

## 工作流

### A. 单条/多条作品公开数据

```powershell
npm run youtube:stats -- videos VIDEO_ID
npm run youtube:stats -- videos ID1,ID2 --part snippet,statistics,contentDetails
```

### B. 频道公开概况

```powershell
npm run youtube:stats -- channels UCxxxxxxxxxxxxxx
```

### C. 自家频道复盘 + HTML 存档（推荐）

```powershell
npm run youtube:stats -- archive
npm run youtube:stats -- archive --days 30
npm run youtube:stats -- archive --start-date 2026-06-15 --end-date 2026-07-15
```

产出（对齐小红书复盘：数据 + 关键发现 + 优化建议）：

```text
$HERMES_ROOT/知识库/youtube/发布复盘/{channelSlug}/
  {YYYY-MM-DD}_作品复盘.html
  {YYYY-MM-DD}_作品复盘.json
  {YYYY-MM-DD}_下次创作参考.md
$HERMES_ROOT/知识库/youtube/发布复盘/LATEST.json
```

对话交付：HTML 路径 + 下次创作参考路径 + 1–2 句结论（勿贴长 JSON）。

### D. 原始 CLI（调试）

```powershell
npm run youtube:stats -- channels
npm run youtube:stats -- report `
  --metrics views,likes,estimatedMinutesWatched `
  --start-date YYYY-MM-DD `
  --end-date YYYY-MM-DD `
  --dimensions video `
  --sort -views `
  --max-results 10
```

## 与 explore 区别

| | yt-viral-research | yt-post-analytics（本技能） |
|--|-------------------|------------------------------|
| 时机 | 发之前 | 发之后 |
| 对象 | 赛道爆款/竞品 | 指定频道或自家作品 |
| 命令 | `npm run youtube:explore` | `npm run youtube:stats` |
