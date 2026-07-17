---
name: dy-skills
description: |
  抖音自动化总览（不进 Hub）：SAU 发布 + 黑底花字创作（已弃用体系，见下）。
  触发：仅作索引；创作用 `dy-create`（已弃用），发布用 `dy-publish`，登录用 `dy-auth`。
  口语：抖音自动化体系、抖音能力总览。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [douyin, publish, overview]
    related_skills:
      - dy-auth
      - dy-publish
---

# 抖音自动化 Skills

> **创作提醒**：`dy-create`（黑底花字 TTS）已弃用，不再默认推荐；教程/动效用 `create/remotion`，创意片用 `create/creative-agent`。仅用户明确要旧口播管线时才用 `dy-create`。

## When to use

- 需要抖音子技能总览、发布前置或渲染器说明

## When not to use

- 已明确子任务（登录/发布）→ 直接用 `dy-auth` / `dy-publish`（本总览不进 Hub）

## 技能边界

| 操作 | 命令 |
|------|------|
| 创作视频 | `npm run pipeline:douyin` / `node skills/publish/douyin/scripts/cli.mjs create-video` |
| 登录 | `npm run douyin:login`（**全程只执行一次**） |
| 校验 cookie | `npm run douyin:check`（只读文件，不开浏览器） |
| 发布 | `npm run douyin:upload`（SAU + 系统 Chrome） |

## 发布前置

1. `npm run overseas:install` — 安装 SAU（`tool/social-auto-upload`）
2. 本机已安装 **Google Chrome**
3. `npm run douyin:login` — 扫码登录，cookie 落在 `tool/social-auto-upload/cookies/douyin_default.json`

**禁止**：

- 同一次任务多次 `douyin:login`（会反复开浏览器）
- 裸 `npx pva` / `douyin:setup`（PVA 已移除）
- upload 失败就立刻再 login

**验证码**：点发布后若弹出验证码，用户须在**同一 Chrome 窗口**手动完成，Agent 不得关浏览器。

## 子技能

| 子技能 | 说明 |
|--------|------|
| `dy-auth`（`skills/publish/douyin/skills/dy-auth`） | 登录 / check |
| `dy-publish`（`skills/publish/douyin/skills/dy-publish`） | SAU 上传已有 MP4 |
| `dy-create`（`create/video/tts-narration/dy-create`） | 口播 MD → 1080×1920 MP4（create 层） |

## 渲染器

- **默认且推荐**：`ffmpeg` + ASS 花字（黑底、关键词高亮、淡入动画）
- 复杂成片请用 `skills/create/video/remotion/` 或 `skills/create/video/creative-agent/`
- 强制：`$env:DOUYIN_RENDERER = "ffmpeg"`

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）
- `npm run overseas:install`（发布）

## 快速开始

```powershell
npm run overseas:install
npm run pipeline:douyin -- --file "$CONTENT_ROOT/文章/抖音/xxx.md"
npm run douyin:login
npm run douyin:check
npm run douyin:upload -- --video "$CONTENT_ROOT/视频/xxx/yyy.mp4" --title "标题 #话题"
```
