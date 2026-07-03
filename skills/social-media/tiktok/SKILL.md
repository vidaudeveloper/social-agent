---
name: tiktok-skills
description: |
  TikTok 海外版自动化：花字竖版视频（英文 Edge TTS，≤90s）+ social-auto-upload 发布。
  当用户要求生成 TikTok 口播视频、pipeline:tiktok、上传 tiktok.com 时触发。
version: 1.1.0
---

# TikTok 海外版 Skills

## 技能边界

| 操作 | 命令 |
|------|------|
| 创作视频 | `npm run pipeline:tiktok` / `tiktok:create-video` |
| 发布 | `npm run tiktok:publish` |

## 子技能

| 子技能 | 说明 |
|--------|------|
| tt-create | 英文口播 MD → 1080×1920 MP4（花字+TTS，60～90s） |
| tt-auth | 登录 / check-login |
| tt-publish | 上传已有 MP4 |

## 视频创作

- 黑底花字 + **英文** Edge TTS（默认 `us-male`）
- 超长口播自动裁切到 **约 90 秒**
- 渲染：ffmpeg ASS（复用抖音花字样式，英文字幕换行）

```powershell
npm run pipeline:tiktok -- -File "D:/test/hermes/文章/TikTok/xxx.md"
npm run tiktok:voices
```

## 发布

基于 [social-auto-upload](https://github.com/dreammis/social-auto-upload) `tk_uploader`：

```powershell
npm run tiktok:login
npm run tiktok:publish -- --video "D:/test/hermes/视频/TikTok/xxx/yyy.mp4" --title "caption #fyp"
```

## 环境变量

- `SAU_ROOT` — social-auto-upload 路径
- `TIKTOK_MAX_DURATION_SEC` — 时长上限（默认 90）
- `TIKTOK_TTS_VOICE` — 音色预设（如 us-female）
