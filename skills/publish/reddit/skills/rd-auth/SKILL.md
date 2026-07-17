---
name: rd-auth
description: |
  Reddit 登录/鉴权（focused-task，上游 tool/reddit-skills + Chrome 扩展）。
  触发：「Reddit 登录」「检查 Reddit 登录态」「reddit:setup」。
  口语：登 Reddit、Reddit 桥接、检查能不能发 Reddit。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [reddit, auth]
    related_skills:
      - rd-skills
      - rd-publish
---

# Reddit 认证（rd-auth）

## When to use

- 用户只要登录检查/桥接安装

## When not to use

- 实际发帖 → **`rd-publish`**

## 技能边界

```powershell
npm run reddit:setup
npm run reddit:check-login
```

- Chrome 中 Reddit 界面语言须为 **English**
- 上游工具在 `tool/reddit-skills`（第三方仓库名，≠ 本技能 `rd-skills`）

详见总览 [`rd-skills`](../../SKILL.md)。
