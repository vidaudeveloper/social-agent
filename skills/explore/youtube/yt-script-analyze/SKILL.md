---
name: yt-script-analyze
description: |
  YouTube 脚本+画面深拆（focused-task，v2.2）。读 scripts_raw，crv 逐帧补画面，提炼钩子/金句，写回后必须 youtube:research。
  触发：「分析脚本结构」「沉淀爆款钩子金句」「crv 画面拆解」「#1 深拆」。
  口语：拆解爆款脚本、金句库、逐帧画面分析。
version: 2.2.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [youtube, explore, analyze, crv, knowledge-base]
    related_skills:
      - yt-viral-research
      - yt-transcript-extract
---

# YouTube 脚本分析 + crv 画面（yt-script-analyze）

## 功能概述

读取 `scripts_raw.json`（须已有 `timed`/`sentences` 或明确 `unavailable`），由 Agent：

1. 用 **crv（claude-real-video）** 对 Top1（建议 Top3）做**逐帧画面**拆解  
2. 提炼 hook / body / cta / 金句 / `deep_dive`  
3. 写回 `scripts_raw.json`  
4. **必须**执行 `npm run youtube:research` 刷新 CLI HTML（禁止手写报告）

## 使用场景

- 已有 `scripts_raw.json`，需要结构/金句/画面方法论
- 「#1 深拆」「crv 拆画面」

## 不适用场景

- 尚未拉字幕 → 先 **`yt-transcript-extract`**（含 whisper）
- 完整编排入口 → **`yt-viral-research`**

## 画面主路径：crv（必遵）

**主工具是 crv，不是 TubePilot。** TubePilot 抽帧若 400 → 忽略，继续 crv。

### Top1 必做；建议 Top3

1. yt-dlp 下载本地 mp4（建议）：

```powershell
$vid = "<videoId>"
$dir = "$env:CONTENT_ROOT\知识库\youtube\_downloads\$vid"
# 若未设 CONTENT_ROOT，用仓库 content\知识库\youtube\_downloads\$vid
# 字幕/whisper 缓存同知识库：content\知识库\youtube\_whisper\$vid\
New-Item -ItemType Directory -Force -Path $dir | Out-Null
uv run yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "$dir\%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$vid"
```

2. **crv 输出目录必须用 Temp**（避免 D: 沙箱 safe-delete 失败）：

```powershell
$out = Join-Path $env:LOCALAPPDATA "Temp\crv-$vid"
New-Item -ItemType Directory -Force -Path $out | Out-Null
# 使用本机 crv venv（可用环境变量 CRV_PYTHON 覆盖）
$py = if ($env:CRV_PYTHON) { $env:CRV_PYTHON } else { "C:\Users\EDY\.workbuddy\binaries\python\envs\claude-video\Scripts\python.exe" }
& $py -m crv "$dir\$vid.mp4" --output "$out"
# 具体子命令以本机 `crv --help` 为准；目标：产出逐帧/拼图/清单供阅读
```

3. 读 crv 产出，写入该条目 `deep_dive`：

- `visual_style_note` — 画面风格总述  
- `visual_timeline_note` — 关键节拍 / 时序要点  
- `viral_points` — 含画面爆点  
- 可选落盘 `analyses/{videoId}.md`（不替代 `scripts_raw`）

## 输入

- `$CONTENT_ROOT/知识库/youtube/{slug}/scripts_raw.json`（必填）
- `$CONTENT_ROOT/知识库/youtube/{slug}/ranked.json`（可选）

## 输出（写回 scripts_raw）

- `structure.hook / body / cta`
- `golden_phrases[]`
- `deep_dive`：`viral_points`、`visual_style_note`、`visual_timeline_note`、`replicability`、`suggested_owners`、`template_outline`

**禁止**改动已有非空的 `timed` / `sentences`（那是原始时间轴台词）。  
无字幕条目：可基于简介+crv 推断 structure，并**明确标注**；不得伪造 `timed`/`sentences`。

## Agent 必做（完整调研）

1. 至少对 **#1** 跑 crv 并写 `visual_*`  
2. Top 5 补 `structure` + `golden_phrases`  
3. 写回 `scripts_raw.json`  
4. **必跑**（刷新 HTML，禁止手写报告）：

```powershell
npm run youtube:research -- --from "$CONTENT_ROOT/知识库/youtube/{slug}/ranked.json" --topic {slug}
```

## Schema

见 [`references/analysis-schema.yaml`](references/analysis-schema.yaml)。

## 对话交付

- **不贴**脚本全文；告知已更新 `scripts_raw` / 已执行 `youtube:research`  
- HTML 路径须来自 CLI；交付前确认含 Chart.js 与「爆款方法论」

## 下游衔接

- 口播稿：`create/tts-narration/yt-create` → `review:lint` → `publish`
