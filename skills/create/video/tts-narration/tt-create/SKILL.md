---
name: tt-create
description: |
  【已弃用体系子技能】TikTok 黑底花字 + 英文 Edge TTS 创作。父技能 tts-narration 已弃用。
  教程/动效请用 create/remotion；创意片请用 create/creative-agent；仅用户明确要「旧口播管线」时才用本技能。
  Skill 路径：create/video/tts-narration/tt-create（目录名与 skill name 一致，避免 Hub 末段撞名）。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [video, tts, tiktok, create, deprecated]
    related_skills:
      - create/video/tts-narration
      - create/remotion
      - create/creative-agent
      - tt-publish
---

# TikTok 视频创作 — 已弃用体系

**不再作为默认或推荐成片方式。** 仅用户明确要求「旧口播管线」时使用。

## When to use

- 用户**明确**说「旧口播管线」「黑底花字」

## When not to use

- 默认成片需求 → **`remotion`** / **`creative-agent`**
- 只发布已有视频 → **`tt-publish`**

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
npm run pipeline:tiktok -- -File "$CONTENT_ROOT/文章/TikTok/xxx.md"
npm run tiktok:voices
npm run tiktok:create-video -- --voice us-female -f "D:/path/script.md"
```

创作完成后：`npm run tiktok:publish -- --video "..." --title "caption #fyp"`
