---
name: tt-auth
description: TikTok 海外版登录与 cookie 校验。
version: 1.0.0
---

# TikTok 认证

```powershell
uv run python skills/tiktok/scripts/cli.py login --account default
uv run python skills/tiktok/scripts/cli.py check-login --account default
```

登录时在弹出的 Chrome 窗口完成 tiktok.com 登录。
