---
name: yt-create
description: |
  【已弃用体系子技能】YouTube 黑底花字 TTS 口播创作。父技能 tts-narration 已弃用，不再默认推荐。
  教程/动效请用 create/remotion；创意片请用 create/creative-agent；仅用户明确要「旧口播管线」时才用本技能。
  Skill 路径：create/video/tts-narration/yt-create（目录名与 skill name 一致；非 publish/youtube）。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [video, tts, youtube, create, deprecated]
    related_skills:
      - create/video/tts-narration
      - create/remotion
      - create/creative-agent
      - yt-publish
---

# YouTube 视频创作 — 已弃用体系

**不再作为默认或推荐成片方式。** 教程/动效 → `remotion`；创意 → `creative-agent`。仅在用户明确要求「恢复旧口播管线」时使用。

## When to use

- 用户**明确**说「旧口播管线」「黑底花字」「edge-tts 老方式」

## When not to use

- 默认成片需求 → **`remotion`**（教程/动效）或 **`creative-agent`**（创意商业片）
- 只发布已有视频 → **`yt-publish`**

## 技能边界

只运行：`node skills/publish/youtube/scripts/cli.mjs create-video`

## 产出

- 口播稿 → `CONTENT_ROOT/文章/YouTube/`
- MP4 → `CONTENT_ROOT/视频/`

## 依赖

- `uv run edge-tts`
- `ffmpeg`
- 背景图：`skills/publish/youtube/assets/default-bg.jpg`

## 命令

```powershell
# 使用 user-profile.md 中的 TTS 音色
node skills/publish/youtube/scripts/cli.mjs create-video

# 自定义脚本（环境变量）
$env:VIDEO_SCRIPT = "Your voiceover text here..."
$env:VIDEO_TITLE = "My Video Title"
node skills/publish/youtube/scripts/cli.mjs create-video
```

创作完成后，用 `yt-publish` 发布。
