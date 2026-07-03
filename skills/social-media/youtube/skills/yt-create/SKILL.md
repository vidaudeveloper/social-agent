---
name: yt-create
description: |
  YouTube 视频创作技能。Edge TTS 配音 + ffmpeg 合成 1280x720 横版视频，不发布。
  当用户要求生成口播视频、TTS 配音、合成 YouTube 视频素材时触发。
version: 1.0.0
---

# YouTube 视频创作

## 技能边界

只运行：`node skills/youtube/scripts/cli.mjs create-video`

## 产出

- 口播稿 → `HERMES_ROOT/文章/YouTube/`
- MP4 → `HERMES_ROOT/视频/`

## 依赖

- `uv run edge-tts`
- `ffmpeg`
- 背景图：`skills/youtube/assets/default-bg.jpg`

## 命令

```powershell
# 使用 user-profile.md 中的 TTS 音色
node skills/youtube/scripts/cli.mjs create-video

# 自定义脚本（环境变量）
$env:VIDEO_SCRIPT = "Your voiceover text here..."
$env:VIDEO_TITLE = "My Video Title"
node skills/youtube/scripts/cli.mjs create-video
```

创作完成后，用 `yt-publish` 发布。
