---
name: dy-auth
description: |
  抖音登录与 cookie 校验（SAU + 系统 Chrome）。发布前扫码登录，或只读校验 cookie。
  当用户要求抖音登录、检查 cookie、douyin:login / douyin:check 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [douyin, auth, sau]
    related_skills:
      - dy-skills
      - dy-publish
---

# 抖音认证（dy-auth）

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
