---
name: li-analytics
description: |
  LinkedIn 发布后数据分析（个人号 Posts/统计）。需先完成 OAuth。
  当用户要求 LinkedIn 数据、帖子表现、linkedin:stats 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [linkedin, analytics, post-publish]
    related_skills:
      - li-skills
      - li-publish
---

# LinkedIn 数据分析（li-analytics）

```powershell
npm run linkedin:setup
npm run linkedin:login
npm run linkedin:stats
npm run linkedin:stats -- -n 20
```

需先完成 OAuth。详见 [`skills/publish/linkedin/references/linkedin-api-setup.md`](../../publish/linkedin/references/linkedin-api-setup.md)。
