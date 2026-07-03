---
name: reddit-skills
description: |
  Reddit 自动化技能。基于 1146345502/reddit-skills（Chrome 扩展桥 + Python CLI）。
  当用户要求发布 Reddit 帖子、浏览 subreddit、搜索 Reddit 时触发。
version: 1.1.0
metadata:
  source: https://github.com/1146345502/reddit-skills
---

# Reddit Skills

通过 **Reddit Bridge** Chrome 扩展 + 本地 WebSocket 桥，在已登录 Chrome 中操作 Reddit（非 CDP，非官方 API）。

## 发布门禁（必读）

流水线 **禁止测试帖**。`submit-text` / `publish` 发布前自动质量检查：

| 拦截项 | 说明 |
|--------|------|
| 测试版块 | `r/test`、`r/cicd` 等（除非 `REDDIT_ALLOW_TEST_SUBREDDIT=true`） |
| 测试文案 | `integration test`、`please ignore`、`hermes`、`pipeline test` 等 |
| Hashtag | 正文/标题中的 `#标签` |
| 过短内容 | 标题 <15 字；正文 <200 字或 <40 词 |

```powershell
# 只检查不发
npm run reddit:validate -- --subreddit TikTokshop --title-file D:\tmp\title.txt --body-file D:\tmp\body.txt

# 检查通过后发布
npm run reddit:publish -- --subreddit TikTokshop --title-file ... --body-file ...
```

文稿归档：`D:/test/hermes/文章/Reddit/`

## 一次性安装

```powershell
npm run tool:install
npm run reddit:setup
```

## 技能边界

```powershell
npm run reddit:check-login
npm run reddit:feed -- --subreddit TikTokshop --sort hot --limit 5
npm run reddit:validate -- --subreddit TikTokshop --title-file ... --body-file ...
npm run reddit:publish -- --subreddit TikTokshop --title-file ... --body-file ...
```

## 运营节奏（2026-06-30 实测）

- 新号先 **评论养 Karma**，勿连发
- `r/TikTokshop`：24h 最多 3 帖；帖间间隔 ≥24h
- 无外链、无 DM、少 emoji；干货 + 结尾提问

## 子技能（上游）

| 技能 | 功能 |
|------|------|
| reddit-auth | 登录检查 |
| reddit-publish | 文本/链接/图片帖（经本仓库质量门禁） |
| reddit-explore | 搜索、浏览 |
