---
name: li-auth
description: |
  LinkedIn OAuth 登录与校验。打开授权页后须用户手动登录授权。
  当用户要求 LinkedIn 登录、linkedin:login / check-login 时触发。
version: 1.0.0
---

# LinkedIn 认证（li-auth / OAuth）

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
