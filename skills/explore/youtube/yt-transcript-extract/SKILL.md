---
name: yt-transcript-extract
description: |
  YouTube 字幕抽取（focused-task，v2）。拉字幕并按句重组，合并进 scripts_raw.json。
  触发：「抽 YouTube 字幕」「拉 transcript」「批量提取口播稿」。
  口语：拿字幕、下载 YouTube 字幕、视频转文字。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, explore, transcript]
    related_skills:
      - yt-script-analyze
      - yt-viral-research
---

# YouTube 字幕抽取（yt-transcript-extract）

## 功能概述

把一个或多个 YouTube 视频的字幕拉下来，按句重组（保留时间轴），合并进 `scripts_raw.json`，供后续脚本分析（钩子 / 结构 / 金句）使用。默认语言 `en,en-US`。**不需要** `YOUTUBE_API_KEY`。

## 使用场景

- 已有视频 ID / 列表，需要拉字幕供后续分析
- 典型说法：「抽 YouTube 字幕」「拉 transcript」「批量提取口播稿」

## 不适用场景

- 已有字幕要提炼钩子 / 金句 → **`yt-script-analyze`**
- 完整调研编排（发现 → 打分 → 字幕 → 分析） → **`yt-viral-research`**

## 用到的技能 / 工具

| 工具 / 技能 | 用途 | 备注 |
|------|----------|------|
| `youtube-transcript-api`（uv 运行） | 默认字幕抽取 | 失败自动降级 |
| yt-dlp 字幕（CLI 内置） | 第一降级 | 自动回退 |
| TubePilot `get_transcript` | 第三备用 | 不需要 Key（已知链接） |
| 本仓库 CLI `npm run youtube:extract` | 单条 / 批量抽取并写入 `scripts_raw.json` | 主入口 |

**失败降级链**：`youtube-transcript-api` → yt-dlp 字幕 → TubePilot `get_transcript` → 仍失败返回 `transcript_status: "unavailable"`，HTML 报告降级为简介要点。

> **画面级拆解（同样免 Key）**：若要拆「画面 / 关键帧 / 时间线」，用 TubePilot 免费工具 `get_video_frames` / `get_frame_at_time` / `get_video_moment` / `video_timeline`（均免 Key，已知链接即可），或沿用本项目已有的 `crv` 逐帧视觉分析。字幕类工具要求视频已开启 captions；无字幕视频可走 `get_video_frames`（视觉）或本地 `faster-whisper` 转写补齐。

## 输入

```powershell
# 单个视频
npm run youtube:extract -- --video-id dQw4w9WgXcQ

# 从 ranked 批量并写入 scripts_raw.json
npm run youtube:extract -- --from "$HERMES_ROOT/知识库/youtube/{slug}/ranked.json" --merge-raw --slug {slug} --topic {slug}
```

参数说明：

- `--video-id <id>` 单个视频
- `--from <ranked.json>` 批量（ranked 列表）
- `--lang <codes>` 默认 `en,en-US`
- `--merge-raw` 与 `--from` 联用：合并输出到 `scripts_raw.json`
- `--slug <slug>` 写入 `scripts_raw.json`（需 `--from`）

## 输出

主产出：`$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json`，每条含：

- `timed[]`：`{ t, text }` 原始 cue
- `sentences[]`：`{ start, end, text }` 按句重组
- `structure`：`{ hook, body, cta }`（CLI 初值，Agent 可精修）
- `golden_phrases[]`（初值为空，由 `yt-script-analyze` 填充）

## 配置

`workspace/references/youtube-explore-setup.md` §3（相对仓库根）：

```powershell
uv pip install youtube-transcript-api
```

**不需要** `YOUTUBE_API_KEY`。

## 对话交付

- 批量抽取完成后，只告知 `scripts_raw.json` 路径与成功条数；不贴字幕全文。
- 若个别视频 `transcript_status: "unavailable"`，提示用户该条无字幕、后续分析将基于简介推断并标注。

## 下游衔接

- 要提炼钩子 / 结构 / 金句 → **`yt-script-analyze`**
- 要完整调研报告（HTML + 金句库） → **`yt-viral-research`**
