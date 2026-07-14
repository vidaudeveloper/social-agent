---
name: douyin-skills
description: |
  抖音自动化技能集合：黑底花字竖版视频（Edge TTS + ffmpeg ASS）、SAU 发布。
  当用户要求生成抖音口播视频、花字短视频、pipeline:douyin 时触发。
version: 1.0.0
---

# 抖音自动化 Skills

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
| dy-create（路径 `create/video/tts-narration/douyin`） | 口播 MD → 1080×1920 MP4 |

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
npm run pipeline:douyin -- --file "$HERMES_ROOT/文章/抖音/xxx.md"
npm run douyin:login
npm run douyin:check
npm run douyin:upload -- --video "$HERMES_ROOT/视频/xxx/yyy.mp4" --title "标题 #话题"
```
