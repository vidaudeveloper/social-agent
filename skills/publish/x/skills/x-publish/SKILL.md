---
name: x-publish
description: |
  X/Twitter 单平台发布（publish-single）。常规帖、视频帖、X Article（baoyu-post-to-x）。
  触发：「发推」「发 X」「发推特」「发布到 X」「tweet」「post to X」。
  口语：发一条推、发推特、X 发帖、上传 X 视频帖。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [x, twitter, publish]
    related_skills:
      - x-auth
      - review
      - pipeline-orchestrator
---

# x-publish

## When to use

- 意图 `publish-single`：已有文案/图/视频/Article，只发布到 X
- 典型说法：「发推」「发推特」「post to X」「发一条 X」

## When not to use

- 从选题到多平台分发 → **`pipeline-orchestrator`**
- 只要登录检查 → **`x-auth`**
- 用 MCP/Playwright 操作 X 网页 → **禁止**（走 `npm run x:publish`）

## 技能边界

- **唯一执行方式**：`npm run x:publish`（包装 `scripts/run-x.mjs`）
- 禁止裸调 baoyu CLI 且漏环境检查

```powershell
# 常规帖（≤280 字非 Premium；Premium 更长）
npm run x:publish -- --text "Your post #hashtag" --image "path/to.jpg"

# 长文 Article（.md，需 X Premium）
npm run x:publish -- --file "$HERMES_ROOT/文章/X/article.md"

# 视频帖
npm run x:publish -- --text "Watch this" --video "$HERMES_ROOT/视频/clip.mp4"
```

默认仅填稿预览；加 `--submit` 或设置 `X_AUTO_SUBMIT=true` 可自动点击 Post。
