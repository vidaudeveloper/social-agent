---
name: rd-publish
description: |
  Reddit 发帖（扩展桥 CLI）。发布前自动质量门禁。
  当用户要求发 Reddit 帖、reddit:publish / submit 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [reddit, publish]
    related_skills:
      - rd-skills
      - rd-auth
---

# Reddit 发布（rd-publish）

## 技能边界

```powershell
npm run reddit:validate -- --subreddit TikTokshop --title-file D:\tmp\title.txt --body-file D:\tmp\body.txt
npm run reddit:publish -- --subreddit TikTokshop --title-file ... --body-file ...
```

禁止测试帖；规则见总览 [`rd-skills`](../../SKILL.md) 与 `skills/review/rules/reddit.yaml`。
