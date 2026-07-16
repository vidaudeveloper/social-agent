---
name: wechat-publish
description: |
  公众号单平台发布（publish-single）。Markdown 文稿进草稿箱（默认），或可选 freepublish。
  触发：「只发公众号」「进草稿」「wechat:publish」。
  口语：发公众号、公众号草稿、正式群发公众号。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [wechat, publish]
    related_skills:
      - wechat-auth
      - pipeline-orchestrator
---

# wechat-publish

## When to use

- 已有 Markdown 文稿，只发布到公众号（默认进草稿）

## When not to use

- 从选题写到多平台分发 → **`pipeline-orchestrator`**
- 只要验密钥 → **`wechat-auth`**

```powershell
npm run wechat:publish -- --file <article.md> [--cover cover.png] [--mode draft_only|full_publish]
```

## 模式

| mode | 行为 |
|------|------|
| `draft_only`（默认） | 创建草稿，返回 `media_id`；人工在 mp 后台群发 |
| `full_publish` | 草稿后调 freepublish；需人工验收首页可见性 |

## 成功判据

- draft：有效 `media_id`
- full：另有 `publish_id`；仍须对照后台确认运营可见成功
