---
name: yt-transcript-extract
description: |
  YouTube 字幕抽取（focused-task，v2.2）。官方字幕 → yt-dlp → faster-whisper，按句重组写入 scripts_raw.json。
  触发：「抽 YouTube 字幕」「拉 transcript」「批量提取口播稿」。
  口语：拿字幕、下载 YouTube 字幕、视频转文字、whisper 转写。
version: 2.2.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [youtube, explore, transcript, whisper]
    related_skills:
      - yt-script-analyze
      - yt-viral-research
---

# YouTube 字幕抽取（yt-transcript-extract）

## 功能概述

把一个或多个 YouTube 视频的字幕拉下来，按句重组（**保留时间轴**），合并进 `scripts_raw.json`。  
失败链：**youtube-transcript-api → yt-dlp 字幕 → faster-whisper / whisper CLI**。  
**不需要** `YOUTUBE_API_KEY`。TubePilot 非必经（400 直接跳过）。

## 使用场景

- 已有视频 ID / `ranked.json`，需要带时间的口播台词
- 典型说法：「抽 YouTube 字幕」「whisper 转写」

## 不适用场景

- 已有字幕要提炼钩子 / 金句 / **crv 画面** → **`yt-script-analyze`**
- 完整调研编排 → **`yt-viral-research`**

## 失败降级链（必遵）

```text
youtube-transcript-api → yt-dlp 字幕 → faster-whisper（或 whisper CLI）→ unavailable
```

| 工具 | 用途 |
|------|------|
| `npm run youtube:extract` | 主入口 |
| `youtube-transcript-api` | 官方/自动字幕 |
| yt-dlp `--write-sub` | 第一降级 |
| `faster-whisper` / `whisper` CLI | 第二降级：下音频后本地转写 |
| TubePilot `get_transcript` | **可选**；400 忽略，不得中断 |

## 输入 / 命令

```powershell
# 单个
npm run youtube:extract -- --video-id dQw4w9WgXcQ --lang zh,zh-Hans,en

# 从 ranked 批量并写入 scripts_raw.json
npm run youtube:extract -- --from "$CONTENT_ROOT/知识库/youtube/{slug}/ranked.json" --merge-raw --slug {slug} --topic {slug} --lang zh,zh-Hans,en

# 跳过 whisper（调试）
npm run youtube:extract -- --video-id xxx --no-whisper
```

- `--lang`：中文话题建议 `zh,zh-Hans,en`；默认 `en,en-US`
- whisper / 字幕中间文件目录（知识库）：`$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}/`（含音频、`transcript.json`；可用 `WHISPER_TMP` 覆盖根目录）
- 成稿时间轴仍合并进话题目录的 `scripts_raw.json`

## 输出

`$CONTENT_ROOT/知识库/youtube/{slug}/scripts_raw.json`，每条：

| 字段 | 含义 |
|------|------|
| `timed[]` | `{ t, text }` 时间 + 台词（cue） |
| `sentences[]` | `{ start, end, text }` 按句重组 |
| `transcript_status` | `ok` / `unavailable` |
| `source` | `youtube-transcript-api` / `yt-dlp-subtitles` / `faster-whisper` / `whisper-cli` |

**硬规则**：

- 成功时 `timed` / `sentences` **必须非空**（这才是「原始脚本：时间+台词」）
- `unavailable` 时二者为空数组，并写 `error`；**禁止**用简介冒充时间轴台词
- 结构/金句由后续 `yt-script-analyze` 填写；简介推断须标注，不得写入 `timed`/`sentences`

## 配置

见 `workspace/references/youtube-explore-setup.md` § 字幕与 whisper。

```powershell
uv pip install youtube-transcript-api
uv pip install faster-whisper
# 或本机已装 openai-whisper CLI：whisper --help
```

## 对话交付

- 只告知 `scripts_raw.json` 路径、成功条数、whisper 兜底条数；不贴字幕全文。

## 下游衔接

- 画面 + 钩子 / 金句 → **`yt-script-analyze`**（crv）
- 完整报告 → **`yt-viral-research`**（必须再跑 `youtube:research`）
