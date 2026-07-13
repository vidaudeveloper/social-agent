---
name: wechat-auth
description: 校验微信公众号 AppID/AppSecret 并获取 access_token。发布前或排查 IP 白名单时使用。
---

# wechat-auth

```powershell
npm run wechat:check-login
```

成功条件：返回有效 `access_token`。失败时优先查：密钥是否正确、本机出口 IP 是否在公众平台白名单。
