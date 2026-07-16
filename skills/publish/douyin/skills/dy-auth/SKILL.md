---
name: dy-auth
description: |
  抖音登录/鉴权（focused-task，SAU + 系统 Chrome）。发布前扫码登录，或只读校验 cookie。
  触发：「抖音登录」「检查抖音 cookie」「douyin:login」「douyin:check」。
  口语：登抖音、检查能不能发抖音、cookie 过期。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [douyin, auth, sau]
    related_skills:
      - dy-skills
      - dy-publish
---

# 抖音认证（dy-auth）

## When to use

- 用户只要登录/检查 cookie

## When not to use

- 实际发布视频 → **`dy-publish`**

## 技能边界

```powershell
npm run overseas:install
npm run douyin:login
npm run douyin:check
```

- **login**：全程只执行一次；会开浏览器扫码，cookie → `tool/social-auto-upload/cookies/douyin_default.json`
- **check**：只读校验，不开浏览器
- 禁止同一次任务多次 login；upload 失败不要立刻再 login

详见总览 [`dy-skills`](../../SKILL.md) 与 [`platform-login-quickstart.md`](../../../../../workspace/references/platform-login-quickstart.md)。
