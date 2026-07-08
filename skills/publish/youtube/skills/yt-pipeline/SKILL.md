---
name: yt-pipeline
description: |
  YouTube 全流程技能。读取用户画像，生成英文口播稿，创作视频并通过 sau 发布。
  当用户要求一键发 YouTube、跑完整内容流水线时触发。
version: 2.0.0
---

# YouTube 全流程流水线

## 技能边界

只运行：`node skills/publish/youtube/scripts/cli.mjs pipeline`

## 前置条件

1. 仓库根目录存在 `user-profile.md`
2. YouTube 区块已填写：频道 ID、TTS 音色、默认可见性
3. sau 已登录（`tool/social-auto-upload/cookies/youtube_default.json` 存在）

## 流程

```
user-profile.md
  → 生成口播稿（HERMES_ROOT/文章/YouTube/）
  → TTS + ffmpeg 合成 MP4
  → sau youtube upload-video
  → 发布报告（HERMES_ROOT/*_youtube发布报告.md）
```

## 命令

```powershell
node skills/publish/youtube/scripts/cli.mjs pipeline
```

## 自定义

| 环境变量 | 作用 |
|----------|------|
| `VIDEO_TITLE` | 覆盖默认标题 |
| `VIDEO_SCRIPT` | 覆盖口播正文 |
| `HERMES_ROOT` | 归档目录 |
