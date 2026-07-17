---
name: li-auth
description: |
  LinkedIn OAuth 登录与校验（focused-task）。打开授权页后须用户手动登录授权。
  触发：「LinkedIn 登录」「linkedin:login」「检查 LinkedIn 登录态」。
  口语：登 LinkedIn、检查能不能发 LinkedIn、授权 LinkedIn。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [linkedin, auth, oauth]
    related_skills:
      - li-publish
---

# LinkedIn 认证（li-auth / OAuth）

## When to use

- 用户只要登录/授权/检查登录态

## When not to use

- 实际发帖 → **`li-publish`**
- 脚本代填账号密码 → **禁止**（仅打开授权页，用户手动登录）

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:setup
npm run linkedin:login
npm run linkedin:check-login
```

- 打开授权页 → 用户手动登录授权 → `profile --save` 存 person ID
- 令牌保存在 `tool/linkedin-cli/.env`
- 需 `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`，见 `references/linkedin-api-setup.md`
- LinkedIn Redirect URL：`http://localhost:3457/callback`
