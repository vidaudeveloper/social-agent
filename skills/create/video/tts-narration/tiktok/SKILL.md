---
name: tt-create
description: |
  TikTok 竖版视频创作：黑底花字 + 英文 Edge TTS + ffmpeg，时长限制约 90 秒，不发布。
  Hermes 路径：create/video/tts-narration/tiktok。
version: 1.0.0
metadata:
  hermes:
    tags: [video, tts, tiktok, create]
    related_skills:
      - create/video/tts-narration
      - publish/tiktok
---

# TikTok 视频创作

## 技能边界

只运行：`node skills/publish/tiktok/scripts/cli.mjs create-video` 或 `npm run pipeline:tiktok`

## 与抖音差异

| 项 | 抖音 | TikTok |
|----|------|--------|
| 口播语言 | 中文 | **英文** |
| 默认音色 | cn-male | **us-male** |
| 时长 | 不限 | **≤90 秒**（自动裁切） |
| 稿件目录 | `文章/抖音/` | `文章/TikTok/` |
| 发布 | `douyin:upload`（SAU） | `tiktok:publish` |

## 命令

```powershell
npm run pipeline:tiktok -- -File "$HERMES_ROOT/文章/TikTok/xxx.md"
npm run tiktok:voices
npm run tiktok:create-video -- --voice us-female -f "D:/path/script.md"
```

创作完成后：`npm run tiktok:publish -- --video "..." --title "caption #fyp"`
