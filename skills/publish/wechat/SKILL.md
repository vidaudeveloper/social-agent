---
name: wechat-skills
description: |
  微信公众号自动化总览（不进 Hub）。纯 Node 调用微信草稿/群发 API。
  触发：仅作索引；实际发布用 `wechat-publish`，验密钥用 `wechat-auth`。
  口语：公众号自动化体系、公众号发布说明。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [wechat, publish, overview]
    related_skills:
      - wechat-auth
      - wechat-publish
---

# 微信公众号 Skills

## When to use

- 需要公众号子技能总览或快速开始说明

## When not to use

- 只要验密钥 → **`wechat-auth`**；只要发布 → **`wechat-publish`**（本总览不进 Hub）

通过微信开放平台 API 将 Markdown 文稿推入**草稿箱**（推荐），可选 `freepublish` 正式发布。

**重要边界**：`freepublish` 技术成功 ≠ 后台手动发布的首页可见行为。生产默认 `draft_only`。

## 技能边界

```powershell
node skills/publish/wechat/scripts/cli.mjs <command>
# 或：npm run wechat:check-login / wechat:publish
```

## 子技能

| 技能 | 命令 | 功能 |
|------|------|------|
| wechat-auth | `check-login` | 验 AppID/Secret，拉 access_token |
| wechat-publish | `publish` | 上传封面/内图 → 草稿；可选正式发 |

## 快速开始

```powershell
# .env 配置 WECHAT_APP_ID / WECHAT_APP_SECRET，并在公众平台加 IP 白名单
npm run wechat:check-login

npm run wechat:publish -- --file "$CONTENT_ROOT/文章/公众号/article.md" --mode draft_only
```

文稿须含 frontmatter：`title`、`summary`；封面为同目录 `cover.png` 或 `--cover` / frontmatter `cover`。

## 与主流水线

social-agent 管线 Step 5 在用户确认后调用本包；默认 `draft_only`。
