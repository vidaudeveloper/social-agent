---
name: tt-skills
description: |
  TikTok 海外版自动化总览（不进 Hub）：花字竖版视频 + social-auto-upload 发布。
  触发：仅作索引；实际创作用 `tt-create`，发布用 `tt-publish`，登录用 `tt-auth`。
  口语：TikTok 自动化体系、TikTok 全流程说明。
version: 1.1.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [tiktok, publish, overview]
    related_skills:
      - tt-auth
      - tt-publish
---

# TikTok 海外版 Skills

> **创作提醒**：`tt-create`（黑底花字 TTS）已弃用，不再默认推荐；教程/动效用 `create/remotion`，创意片用 `create/creative-agent`。仅用户明确要旧口播管线时才用 `tt-create`。

## When to use

- 需要 TikTok 子技能总览、环境变量或运营节奏

## When not to use

- 只要登录 → **`tt-auth`**；只要发布 → **`tt-publish`**；只要创作视频 → `tt-create`（本总览不进 Hub）

## 技能边界

| 操作 | 命令 |
|------|------|
| 创作视频 | `npm run pipeline:tiktok` / `tiktok:create-video` |
| 发布 | `npm run tiktok:publish` |

## 子技能

| 子技能 | 说明 |
|--------|------|
| tt-create（路径 `create/video/tts-narration/tt-create`） | 英文口播 MD → 1080×1920 MP4 |
| tt-auth | 登录 / check-login（`skills/publish/tiktok/skills/tt-auth/`） |
| tt-publish | 上传已有 MP4 |

## 视频创作

- 黑底花字 + **英文** Edge TTS（默认 `us-male`）
- 超长口播自动裁切到 **约 90 秒**
- 渲染：ffmpeg ASS（复用抖音花字样式，英文字幕换行）

```powershell
npm run pipeline:tiktok -- -File "$HERMES_ROOT/文章/TikTok/xxx.md"
npm run tiktok:voices
```

## 发布

基于 [social-auto-upload](https://github.com/dreammis/social-auto-upload) `tk_uploader`：

```powershell
npm run tiktok:login
npm run tiktok:publish -- --video "$HERMES_ROOT/视频/TikTok/xxx/yyy.mp4" --title "caption #fyp"
```

## 环境变量

- `SAU_ROOT` — social-auto-upload 路径
- `TIKTOK_PROXY` / `TK_PROXY` — 代理（国内必配；或在 `conf.py` 设 `TK_PROXY`）
- `TIKTOK_MAX_DURATION_SEC` — 时长上限（默认 90）
- `TIKTOK_TTS_VOICE` — 音色预设（如 us-female）

国内访问 TikTok：Playwright 不吃系统代理，页面会一直加载。见 `skills/publish/tiktok/skills/tt-auth/SKILL.md`。
