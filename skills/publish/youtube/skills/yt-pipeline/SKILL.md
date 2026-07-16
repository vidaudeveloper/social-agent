---
name: yt-pipeline
description: |
  YouTube 单平台全流程（选题画像→口播稿→合成→sau 发布，均限定 YouTube 一个平台）。
  触发：「一键发 YouTube」「YouTube 完整流水线」「只做 YouTube 全流程」。
  口语：YouTube 一条龙、自动生成并发 YouTube。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, pipeline, sau]
    related_skills:
      - yt-create
      - yt-publish
      - yt-auth
---

# YouTube 全流程流水线

## When to use

- 用户只要 YouTube **单平台**的选题→稿→视频→发布，不涉及其它平台

## When not to use

- 需要多平台分发（YouTube + 其它） → **`pipeline-orchestrator`**
- 已有 MP4 只发布 → **`yt-publish`**
- 只要创作视频不发布 → **`yt-create`**

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
