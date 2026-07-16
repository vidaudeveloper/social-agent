---
name: dy-create
description: |
  【已弃用体系子技能】抖音黑底花字 + Edge TTS 创作。父技能 tts-narration 已弃用。FFCreator 已不推荐。
  教程/动效请用 create/remotion；创意片请用 create/creative-agent；仅用户明确要「旧口播管线」时才用本技能。
  Hermes 路径：create/video/tts-narration/dy-create（目录名与 skill name 一致，避免 Hub 末段撞名）。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [video, tts, douyin, create, deprecated]
    related_skills:
      - create/video/tts-narration
      - create/remotion
      - create/creative-agent
      - dy-publish
---

# 抖音视频创作 — 已弃用体系

**不再作为默认或推荐成片方式。** 仅用户明确要求「旧口播管线」时使用。

## When to use

- 用户**明确**说「旧口播管线」「黑底花字」

## When not to use

- 默认成片需求 → **`remotion`** / **`creative-agent`**
- 只发布已有视频 → **`dy-publish`**

## 技能边界

只运行：`node skills/publish/douyin/scripts/cli.mjs create-video` 或 `npm run pipeline:douyin`

## 产出

- 口播稿 → `HERMES_ROOT/文章/抖音/`
- MP4 → `HERMES_ROOT/视频/{slug}/`
- manifest.json → 标题、路径、时长、音色

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）
- ~~FFCreator~~：不推荐；高质量视频见 `skills/create/video/creative-agent/` 或 `skills/create/video/remotion/`

## 命令

```powershell
npm run douyin:voices
npm run pipeline:douyin -- -Slug "{slug}"
npm run pipeline:douyin -- -File "$HERMES_ROOT/文章/抖音/xxx.md"
npm run douyin:create-video -- --voice cn-female -f "D:/path/script.md"
```

## 配音音色

引擎：**Edge TTS**（免费）。默认 **国内男声** `cn-male` → `zh-CN-YunxiNeural`。

| 类型 | 预设 ID | 说明 |
|------|---------|------|
| 国内男 | cn-male / cn-male-pro / cn-male-passion | 中文口播 |
| 国内女 | cn-female / cn-female-lively | 中文口播 |
| 海外男 | us-male / us-male-casual / uk-male | 英文稿 |
| 海外女 | us-female / us-female-warm / uk-female | 英文稿 |

在 `user-profile.md` 的 `## 抖音配置` 设置 `TTS 音色: cn-female`，或命令行 `--voice` 临时覆盖。

创作完成后，用 `npm run douyin:upload` 发布（SAU + 系统 Chrome）。
