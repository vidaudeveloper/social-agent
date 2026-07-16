---
name: tt-auth
description: |
  TikTok 登录/鉴权（focused-task，SAU + 系统 Chrome）。国内须配代理。
  触发：「TikTok 登录」「检查 TikTok 登录态」「tiktok:login」。
  口语：登 TikTok、检查能不能发 TikTok、TikTok 代理配置。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [tiktok, auth, sau]
    related_skills:
      - tt-publish
---

# TikTok 认证（tt-auth）

## When to use

- 用户只要登录/检查登录态，或代理配置问题

## When not to use

- 实际发布视频 → **`tt-publish`**（禁止 publish 前预防性 check-login）

**前置**：`npm run overseas:install`

## 国内必配代理

Playwright **不会**走 Windows 系统代理。若 TikTok 一直「加载中」、进不了首页，先在 `tool/social-auto-upload/conf.py` 配置：

```python
TK_PROXY = "http://127.0.0.1:7890"  # 改成你的 Clash/V2Ray 本地端口
```

也可用环境变量：`$env:TIKTOK_PROXY = "http://127.0.0.1:7890"`  
若已配 `YT_PROXY`，未配 `TK_PROXY` 时会自动复用 `YT_PROXY`。

先用**同一代理**在普通 Chrome 里确认能打开 https://www.tiktok.com ，再跑 login。

## 登录

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run tiktok:login
npm run tiktok:check-login
```

1. 弹出 **系统 Chrome**（持久配置目录，非无头）
2. 打开 TikTok **首页**（非强制 /login，减少卡加载）
3. 在浏览器里手动登录
4. 回到终端 **按 Enter** → 跳转上传页校验；失败可继续登录后重试 Enter

## 校验

`check-login` 访问 TikTok Studio 上传页，确认会话有效。

## 禁止

- 禁止连跑多次 `tiktok:login`（间隔 ≥30 分钟）
- 禁止裸 `python cli.py login`（须走 `run-tiktok.mjs` + SAU 的 uv 环境）
