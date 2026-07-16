---
name: rd-publish
description: |
  Reddit 单平台发布（publish-single，扩展桥 CLI）。发布前自动质量门禁。
  触发：「只发 Reddit」「发 Reddit 帖」「reddit:publish」。
  口语：发 Reddit、提交 Reddit 帖子、submit 到 subreddit。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [reddit, publish]
    related_skills:
      - rd-skills
      - rd-auth
      - pipeline-orchestrator
---

# Reddit 发布（rd-publish）

## When to use

- 已有文案，只发布到指定 subreddit

## When not to use

- 从选题到多平台分发 → **`pipeline-orchestrator`**
- 只要登录检查 → **`rd-auth`**
- 测试帖/占位内容 → **禁止**（见发布门禁）

## 技能边界

```powershell
npm run reddit:validate -- --subreddit TikTokshop --title-file D:\tmp\title.txt --body-file D:\tmp\body.txt
npm run reddit:publish -- --subreddit TikTokshop --title-file ... --body-file ...
```

禁止测试帖；规则见总览 [`rd-skills`](../../SKILL.md) 与 [`../../../../review/rules/reddit.yaml`](../../../../review/rules/reddit.yaml)。
