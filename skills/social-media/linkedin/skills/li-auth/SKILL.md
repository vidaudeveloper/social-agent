---
name: li-auth
description: LinkedIn OAuth 授权（官方 API，用户手动登录后终端确认）。
version: 2.0.0
---

# LinkedIn 认证（OAuth）

```powershell
npm run linkedin:login
npm run linkedin:check-login
```

`login`：按 Enter → 打开授权页 → **你手动登录授权** → 再按 Enter 存令牌。  
`check-login`：按 Enter 后 **只请求一次** userinfo。

需 `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`，见 `references/linkedin-api-setup.md`。
