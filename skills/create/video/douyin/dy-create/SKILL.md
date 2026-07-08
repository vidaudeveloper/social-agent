---
name: dy-create
description: |
  抖音竖版视频创作：黑底花字 + Edge TTS + ffmpeg 合成 1080x1920，不发布。FFCreator 已不推荐。
version: 1.0.0
---

# 抖音视频创作

## 技能边界

只运行：`node skills/publish/douyin/scripts/cli.mjs create-video` 或 `npm run pipeline:douyin`

## 产出

- 口播稿 → `HERMES_ROOT/文章/抖音/`
- MP4 → `HERMES_ROOT/视频/{slug}/`
- manifest.json → 标题、路径、时长、音色

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）
- ~~FFCreator~~：不推荐；高质量视频见 `workspace/references/creative-agent-routing.md`

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

创作完成后，用 PVA `npm run douyin:upload` 发布。
