---
name: wechat-auth
description: |
  微信公众号登录/鉴权（focused-task）。校验 AppID/AppSecret 并获取 access_token。
  触发：「公众号登录检查」「wechat check-login」「IP 白名单排查」。
  口语：查公众号密钥、能不能发公众号、access_token 过期。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [wechat, auth]
    related_skills:
      - wechat-publish
---

# wechat-auth

## When to use

- 只要校验密钥/access_token，或排查 IP 白名单

## When not to use

- 实际发布文稿 → **`wechat-publish`**

```powershell
npm run wechat:check-login
```

成功条件：返回有效 `access_token`。失败时优先查：密钥是否正确、本机出口 IP 是否在公众平台白名单。
