# TikTok 认证

**前置**：`npm run overseas:install`

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run tiktok:login
npm run tiktok:check-login
```

## 登录流程

1. 终端执行 `npm run tiktok:login`
2. 弹出 **系统 Chrome**（非无头），打开 TikTok 登录页
3. 你在浏览器里 **手动登录**（邮箱/手机/Google 等）
4. 登录成功后回到终端 **按 Enter** — 脚本会跳转上传页校验；未通过可继续在浏览器登录后重试 Enter

**不要**依赖 Playwright Inspector 的 Resume；旧版 SAU `page.pause()` 容易一闪而过导致假登录成功。

## 校验

`check-login` 会加载 cookie 并访问 TikTok Studio 上传页，确认会话仍有效（不仅看文件是否存在）。

## 禁止

- 禁止连跑多次 `tiktok:login`（间隔 ≥30 分钟）
- 禁止裸 `python cli.py login`（须走 `run-tiktok.mjs` + SAU 的 uv 环境）
