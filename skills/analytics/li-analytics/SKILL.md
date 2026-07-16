---
name: li-analytics
description: |
  LinkedIn 发后数据分析（analytics）。个人号 Posts/统计，需先完成 OAuth。
  触发：「LinkedIn 数据」「帖子表现」「linkedin:stats」。
  口语：LinkedIn 表现怎么样、帖子互动数据。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [linkedin, analytics, post-publish]
    related_skills:
      - li-skills
      - li-publish
      - li-auth
---

# LinkedIn 数据分析（li-analytics）

## When to use

- 查已发布 LinkedIn 帖子的表现数据

## When not to use

- 发布新帖 → **`li-publish`**
- 只要登录 → **`li-auth`**

```powershell
npm run linkedin:setup
npm run linkedin:login
npm run linkedin:stats
npm run linkedin:stats -- -n 20
```

需先完成 OAuth。详见 [`skills/publish/linkedin/references/linkedin-api-setup.md`](../../publish/linkedin/references/linkedin-api-setup.md)。
