---
name: rd-auth
description: |
  Reddit 桥接与登录检查（上游 tool/reddit-skills + Chrome 扩展）。
  当用户要求 Reddit 登录检查、reddit:setup / reddit:check-login 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [reddit, auth]
    related_skills:
      - rd-skills
      - rd-publish
---

# Reddit 认证（rd-auth）

## 技能边界

```powershell
npm run reddit:setup
npm run reddit:check-login
```

- Chrome 中 Reddit 界面语言须为 **English**
- 上游工具在 `tool/reddit-skills`（第三方仓库名，≠ 本技能 `rd-skills`）

详见总览 [`rd-skills`](../../SKILL.md)。
