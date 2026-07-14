---
name: tts-narration
description: |
  【已弃用】黑底花字 TTS 口播。新需求不要激活本技能。
  教程/动效请用 create/remotion；创意片请用 create/creative-agent。
  仅在用户明确要求「恢复旧口播管线」时才使用。
version: 1.1.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [video, tts, edge-tts, ffmpeg, narration, deprecated]
    related_skills:
      - create/remotion
      - create/creative-agent
---

# TTS 口播视频（tts-narration）— 已弃用

**不再作为默认或推荐成片方式。** 教程与动效 → `create/remotion`；创意 → `create/creative-agent`。

以下内容仅供历史管线排障，新项目勿跟做。

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
