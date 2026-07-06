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
| 创作视频 | `npm run pipeline:douyin` / `node skills/douyin/scripts/cli.mjs create-video` |
| 发布 | `npm run douyin:upload`（PVA） |

## 子技能

| 子技能 | 说明 |
|--------|------|
| dy-create | 口播 MD → 1080×1920 MP4 + manifest |

## 渲染器

- **默认且推荐**：`ffmpeg` + ASS 花字（黑底、关键词高亮、淡入动画）
- **FFCreator**：已不推荐（仅 Linux/macOS 遗留可选）；复杂成片请用 [creative-agent](https://github.com/vidaudeveloper/creative-agent)
- 强制：`$env:DOUYIN_RENDERER = "ffmpeg"`

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）

## 快速开始

```powershell
npm run pipeline:douyin -- -File "$HERMES_ROOT/文章/抖音/xxx.md"
npm run douyin:upload -- --video "$HERMES_ROOT/视频/xxx/yyy.mp4" --title "标题 #话题"
```
