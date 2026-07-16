---
name: zh-auth
description: |
  知乎登录与登录态校验（pyzhihu-cli）。
  当用户要求知乎登录、zhihu:login / zhihu:check-login 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [zhihu, auth]
    related_skills:
      - zh-skills
      - zh-publish
---

# 知乎认证（zh-auth）

## 技能边界

```powershell
uv tool install pyzhihu-cli
npm run zhihu:login
npm run zhihu:check-login
```

详见总览 [`zh-skills`](../../SKILL.md)。
