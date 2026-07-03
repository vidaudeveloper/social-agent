---
name: tt-publish
description: TikTok 海外版视频发布。当用户要上传 MP4 到 tiktok.com 时触发。
version: 1.0.0
---

# TikTok 发布

## 命令

```powershell
uv run python skills/tiktok/scripts/cli.py publish `
  --video "D:/test/hermes/视频/xxx.mp4" `
  --title "口播文案 #话题1 #话题2" `
  --account default
```

## 前置

1. `tool/social-auto-upload` 已安装（`scripts/install-overseas-tools.ps1`）
2. 已执行 `login` 并保存 cookie
3. 视频路径为绝对路径

## 说明

- 底层为 social-auto-upload `tk_uploader`（非官方 API）
- TikTok 暂无 `sau tiktok` 统一 CLI，本 skill 封装 Python 入口
- 与「抖音」`publishing-douyin` / `sau douyin` 不同平台
