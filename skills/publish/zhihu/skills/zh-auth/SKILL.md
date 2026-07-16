---
name: zh-auth
description: |
  知乎登录/鉴权（focused-task，pyzhihu-cli）。
  触发：「知乎登录」「检查知乎登录态」「zhihu:login」。
  口语：登知乎、检查能不能发知乎。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [zhihu, auth]
    related_skills:
      - zh-skills
      - zh-publish
---

# 知乎认证（zh-auth）

## When to use

- 用户只要登录/检查登录态

## When not to use

- 实际发布长文 → **`zh-publish`**

## 技能边界

```powershell
uv tool install pyzhihu-cli
npm run zhihu:login
npm run zhihu:check-login
```

详见总览 [`zh-skills`](../../SKILL.md)。
