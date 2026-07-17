---
name: tt-publish
description: |
  TikTok 单平台发布（publish-single）。上传已有 MP4 到 tiktok.com。
  触发：「只发 TikTok」「上传这个视频到 TikTok」「tiktok:publish」。
  口语：发 TikTok、TikTok 上传、把视频传到 TikTok。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [tiktok, publish, sau]
    related_skills:
      - tt-auth
      - pipeline-orchestrator
---

# TikTok 发布

## When to use

- 已有 MP4，只发布到 TikTok

## When not to use

- 从选题写到多平台分发 → **`pipeline-orchestrator`**
- 只要登录检查 → **`tt-auth`**（禁止 publish 前先跑 check-login）

## 命令

```powershell
npm run tiktok:publish -- `
  --video "$CONTENT_ROOT/视频/xxx.mp4" `
  --title "口播文案 #fyp" `
  --draft `
  --account default
```

`--draft`：部分账号/地区 Studio **无 Save draft 按钮**（仅 Post / Discard），此时请去掉 `--draft` 直接发布。

直接发布（推荐）：

```powershell
npm run tiktok:publish -- `
  --video "$CONTENT_ROOT/视频/xxx.mp4" `
  --title "caption #fyp" `
  --account default
```

发布后浏览器会打开 **Content** 页并保持，终端按 Enter 关闭。

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
