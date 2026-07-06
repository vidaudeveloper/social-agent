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

> **发布前质量规则**以 [`content-reviewer/rules/reddit.yaml`](../../content-reviewer/rules/reddit.yaml) 为准；等效 CLI：`npm run review:lint -- --platform reddit ...` 或 `npm run reddit:validate`。

通过 **Reddit Bridge** Chrome 扩展 + 本地 WebSocket 桥，在已登录 Chrome 中操作 Reddit（非 CDP，非官方 API）。

## 前置条件（必读）

1. 执行 `npm run reddit:setup` 安装上游 `reddit-skills` 与 Chrome 扩展
2. Chrome 中 **Reddit 界面语言必须为 English**（设置 → Display language）
3. 桥接地址默认 `ws://localhost:9334`

## 运行失败时的第一排查步骤

1. **先确认** Reddit 网页界面语言是否为 **English**
2. 若不是 → 提示用户改为 English 后重试，话术示例：

   > Reddit 操作失败。请先确认 Chrome 中 Reddit 界面语言为 English（设置 → Display language）。当前若为中文界面，请改为英文后重试。

3. 已是英文仍失败 → 再查扩展是否启用、bridge 是否运行、是否已登录 Reddit

## 发布门禁

流水线 **禁止测试帖**。`submit-text` / `publish` 发布前自动质量检查：

| 拦截项 | 说明 |
|--------|------|
| 测试版块 | `r/test`、`r/cicd` 等（除非 `REDDIT_ALLOW_TEST_SUBREDDIT=true`） |
| 测试文案 | `integration test`、`please ignore`、`hermes`、`pipeline test` 等 |
| Hashtag | 正文/标题中的 `#标签` |
| 过短内容 | 标题 <15 字；正文 <200 字或 <40 词 |

```powershell
npm run reddit:validate -- --subreddit TikTokshop --title-file D:\tmp\title.txt --body-file D:\tmp\body.txt
npm run reddit:publish -- --subreddit TikTokshop --title-file ... --body-file ...
```

文稿归档：`$HERMES_ROOT/文章/Reddit/`

## 一次性安装

```powershell
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
