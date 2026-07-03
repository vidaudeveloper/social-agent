---
name: yt-auth
description: |
  YouTube sau 认证技能。检查/引导 social-auto-upload 登录。
  遇 check invalid 或 sau 报错时先读 references/sau-runbook.md。
version: 2.0.0
---

# YouTube 认证（仅 sau）

## 技能边界

只运行：
- `node skills/youtube/scripts/cli.mjs login`
- `node skills/youtube/scripts/cli.mjs check-login`

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
