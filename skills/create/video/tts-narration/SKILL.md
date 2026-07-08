---
name: tts-narration
description: |
  纯文字 + Edge TTS + ffmpeg 口播视频（黑底花字竖版或横版）。用户要「口播视频」「TTS 成片」「pipeline:douyin/tiktok」时激活。
  复杂动效请用 create/remotion；商业创意片请用 create/creative-agent。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [video, tts, edge-tts, ffmpeg, narration]
    related_skills:
      - create/remotion
      - create/creative-agent
      - create/pipeline-orchestrator
---

# TTS 口播视频（tts-narration）

**默认轻量成片方案**：不依赖 Remotion、不依赖 Playwright。

## 平台子技能

| 平台 | 子技能 | 画幅 | 口播语言 | 命令入口 |
|------|--------|------|----------|----------|
| 抖音 | [douyin/SKILL.md](douyin/SKILL.md) | 1080×1920 竖版 | 中文 | `npm run pipeline:douyin` |
| TikTok | [tiktok/SKILL.md](tiktok/SKILL.md) | 1080×1920 竖版 | **英文** | `npm run pipeline:tiktok` |
| YouTube | [youtube/SKILL.md](youtube/SKILL.md) | 1280×720 横版 | 英文为主 | `node skills/publish/youtube/scripts/cli.mjs create-video` |

## 依赖

- `uv` + `edge-tts`
- `ffmpeg`（含 libass，竖版花字）

## 与 Remotion / creative-agent 的分工

| 类型 | 何时用 |
|------|--------|
| **tts-narration**（本技能） | 口播稿 → 快速出片，管线 Step 4 后可选 |
| **remotion** | 需要 React 动效、多场景、品牌模板、精细字幕动画 |
| **creative-agent** | 趋势短片、产品 URL 成片、需 MCP/Vision |

## 产出

- 文稿：`$HERMES_ROOT/文章/{平台}/`
- 视频：`$HERMES_ROOT/视频/{slug}/` + `manifest.json`（抖音）
