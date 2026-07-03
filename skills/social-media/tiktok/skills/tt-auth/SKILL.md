---
name: tt-auth
description: TikTok 海外版登录与 cookie 校验。
version: 1.0.0
---

# TikTok 认证

**前置**：`npm run overseas:install`（profile 根目录，安装 sau + playwright）

```powershell
$env:SAU_ROOT = "D:\test\tool\social-auto-upload"
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run tiktok:login
npm run tiktok:check-login
```

等价于 `uv run --directory $SAU_ROOT python skills/social-media/tiktok/scripts/cli.py login`。

**禁止**裸 `python scripts/cli.py login`（Hermes/Vidau 自带 venv 无 playwright）。

登录时在弹出的 Chrome 窗口完成 tiktok.com 登录。
