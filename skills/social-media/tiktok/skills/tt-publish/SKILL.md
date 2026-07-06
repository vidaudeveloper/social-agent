---
name: tt-publish
description: TikTok 海外版视频发布。当用户要上传 MP4 到 tiktok.com 时触发。
version: 1.0.0
---

# TikTok 发布

## 命令

```powershell
npm run tiktok:publish -- `
  --video "$HERMES_ROOT/视频/xxx.mp4" `
  --title "口播文案 #fyp" `
  --draft `
  --account default
```

`--draft`：点击 **Save draft** 进 Studio 草稿箱；完成后**自动打开草稿页且浏览器保持打开**，终端按 Enter 才关闭。

可选：`$env:TIKTOK_HOLD_BROWSER_SEC = "600"` 才会在 N 秒后自动关（默认不设 = 一直开着）。

## 风控

- **不要** publish 前先 `check-login`（会多开一次浏览器）
- publish 只开 **一个** Chrome 窗口，上传过程带随机间隔
- 失败不要立刻重试，间隔 ≥30 分钟

## 前置

1. `tool/social-auto-upload` 已安装（`scripts/install-overseas-tools.ps1`）
2. 已执行 `login` 并保存 cookie
3. 视频路径为绝对路径

## 说明

- 底层为 social-auto-upload `tk_uploader`（非官方 API）
- TikTok 暂无 `sau tiktok` 统一 CLI，本 skill 封装 Python 入口
- 与「抖音」`publishing-douyin` / `sau douyin` 不同平台
