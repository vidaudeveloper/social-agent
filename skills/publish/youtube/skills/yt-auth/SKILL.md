---
name: yt-auth
description: |
  YouTube 登录/鉴权（focused-task）。sau check-login / login，排查 cookie 失效。
  触发：「YouTube 登录」「检查 YouTube 登录态」「cookie 失效」。
  口语：登 YouTube、Studio 登录、检查能不能发 YouTube。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, auth, sau]
    related_skills:
      - yt-publish
---

# YouTube 认证（仅 sau）

## When to use

- 用户只要登录/检查登录态，或 publish 前 sau 明确提示 cookie 失效
- 典型说法：「YouTube 登录」「检查能不能发」「cookie 过期了」

## When not to use

- 实际发布视频 → **`yt-publish`**（不要连跑 login + publish 除非用户确认）
- publish 前**预防性** check-login → **禁止**（易触发风控，见技能边界）
- Playwright/MCP 替代 sau → **禁止**

## 技能边界

只运行：
- `node skills/publish/youtube/scripts/cli.mjs login`
- `node skills/publish/youtube/scripts/cli.mjs check-login`

**禁止** Playwright / CDP / PVA 等替代路径。

## 登录（一次性）

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:login
```

Cookie 保存到：`tool/social-auto-upload/cookies/youtube_default.json`

## 检查登录（尽量少用）

**警告**：check-login 会单独开一个 Chrome 访问 Studio。禁止在 publish 前连跑 check-login（易触发 Google 风控）。

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:check-login
```

输出 JSON：`{ ok, loggedIn, account, backend: "sau", cookieFile }`

## check 返回 invalid 时

1. 检查 `conf.py` 的 `YT_PROXY`
2. **勿立即 re-login**，间隔至少 30 分钟
3. 日常可直接 `publish`
