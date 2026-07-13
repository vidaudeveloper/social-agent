---
name: wechat-skills
description: |
  微信公众号发布。纯 Node 调用微信草稿/群发 API（零第三方依赖）。
  默认 draft_only：自动进草稿箱，人工在公众平台群发。
  当用户要求发公众号、微信草稿、wechat publish 时触发。
version: 1.0.0
---

# 微信公众号 Skills

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

npm run wechat:publish -- --file "$HERMES_ROOT/文章/公众号/article.md" --mode draft_only
```

文稿须含 frontmatter：`title`、`summary`；封面为同目录 `cover.png` 或 `--cover` / frontmatter `cover`。

## 与主流水线

social-agent 管线 Step 5 在用户确认后调用本包；默认 `draft_only`。
