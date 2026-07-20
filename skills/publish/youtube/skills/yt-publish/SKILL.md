---
name: yt-publish
description: |
  YouTube 发布（publish）。通过 sau 上传并发布 MP4 到 Studio。
  触发：「上传 YouTube」「发布这个 MP4」「传到频道」「只发 YouTube」。
  口语：发 YouTube、上传视频、YouTube 发布、把这个视频传上去。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [youtube, publish, sau]
    related_skills:
      - yt-auth
      - yt-post-analytics
      - pipeline-orchestrator
---

# YouTube 视频发布（sau）

## When to use

- 意图 `publish`：已有 MP4 + 标题/描述，发布到 YouTube
- 用户说「只发 YouTube」「上传这个视频」「发布到频道」
- 登录问题单独出现时先 **`yt-auth`**，发布仍回本技能（gate: `auth_if_required`）

## When not to use

- 从选题、写稿做到发布 → **`pipeline-orchestrator`**（`full-workflow`）
- 查频道/视频发后数据 → **`yt-post-analytics`**
- 发前爆款调研 → **`yt-viral-research`** / **`yt-viral-discover`**
- 用 MCP/Playwright 操作 Studio → **禁止**（见技能边界）

## 技能边界

只运行：`node skills/publish/youtube/scripts/cli.mjs publish`

## 必做约束

- 发布前用户确认：标题、描述、可见性
- 视频路径必须为绝对路径
- **日常直接 publish**；仅在首次或 sau 明确提示 cookie 失效时才 login
- **禁止** check 失败后立即 re-login
- **禁止** publish 前先跑 `check-login`（会多开一次浏览器，易触发 Google 风控）
- **禁止**用 Cursor/MCP 浏览器操作 YouTube Studio（只用 sau CLI 自带 Chrome）
- **禁止**失败后立即重试 publish；至少间隔 30 分钟
- **单次任务只执行一条** `npm run youtube:publish`，不要连跑或拆成多步浏览器操作

## 命令

```powershell
npm run youtube:publish -- `
  --video "$CONTENT_ROOT/视频/xxx.mp4" `
  --title "视频标题" `
  --description "视频描述" `
  --privacy unlisted
```

## 环境变量

- `YOUTUBE_ACCOUNT_ID` — sau 账号名
- `SAU_HEADED=true` — 上传时有头浏览器（可选）
