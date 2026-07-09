---
name: douyin-skills
description: |
  抖音自动化技能集合：黑底花字竖版视频（Edge TTS + ffmpeg ASS）、PVA 发布。
  当用户要求生成抖音口播视频、花字短视频、pipeline:douyin 时触发。
version: 1.0.0
---

# 抖音自动化 Skills

## 技能边界

| 操作 | 命令 |
|------|------|
| 安装 Playwright（PVA） | `npm run douyin:setup` |
| 创作视频 | `npm run pipeline:douyin` / `node skills/publish/douyin/scripts/cli.mjs create-video` |
| 登录 | `npm run douyin:sau-login`（**推荐 SAU**）或 `npm run douyin:login`（PVA） |
| 发布 | `npm run douyin:sau-upload`（**推荐 SAU**）或 `npm run douyin:upload`（PVA） |

## Playwright（发布前置）

抖音发布依赖 PVA → Playwright Chromium。**必须先** `npm run douyin:setup`：

- 浏览器目录：`{profile}/tool/playwright-browsers`（与 `tool/social-auto-upload` 同级，**禁止**默认装 C 盘）
- 国内慢/卡住：换 `cdn.npmmirror.com` 镜像；Agent 详见 [`playwright-install-runbook.md`](../../../workspace/references/playwright-install-runbook.md)
- 版本：`playwright@1.61.1`（chromium v1228）

## 子技能

| 子技能 | 说明 |
|--------|------|
| dy-create | 口播 MD → 1080×1920 MP4（见 [`create/video/tts-narration/douyin`](../../create/video/tts-narration/douyin/SKILL.md)） |

## 渲染器

- **默认且推荐**：`ffmpeg` + ASS 花字（黑底、关键词高亮、淡入动画）
- 复杂成片请用 [`create/video/remotion`](../../create/video/remotion/SKILL.md) 或 [`create/video/creative-agent`](../../create/video/creative-agent/SKILL.md)
- 强制：`$env:DOUYIN_RENDERER = "ffmpeg"`

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）

## 快速开始

```powershell
npm run douyin:setup
npm run pipeline:douyin -- --file "$HERMES_ROOT/文章/抖音/xxx.md"
npm run douyin:login
npm run douyin:upload -- --video "$HERMES_ROOT/视频/xxx/yyy.mp4" --title "标题 #话题"
```

Agent 安装/排障：[`workspace/references/playwright-install-runbook.md`](../../../workspace/references/playwright-install-runbook.md)
