---
name: yt-script-analyze
description: |
  YouTube 脚本深拆分析（focused-task，v2）。读 scripts_raw.json，提炼钩子/结构/金句，写回知识库。
  触发：「分析脚本结构」「沉淀爆款钩子金句」「补充复刻模板」「#1 深拆」。
  口语：拆解爆款脚本、金句库、结构分析。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, explore, analyze, knowledge-base]
    related_skills:
      - yt-viral-research
      - yt-transcript-extract
---

# YouTube 脚本分析 + 知识库沉淀（yt-script-analyze）

## 功能概述

读取已抽好字幕的 `scripts_raw.json`，由 Agent 对爆款视频做**脚本深拆**：提炼钩子（hook）、结构（body / cta）、金句（golden_phrases），并为 Top 条目（至少 #1）补充可复刻模板，写回知识库。本技能**主要靠 Agent 分析驱动**，CLI 仅负责刷新 HTML 与追加金句库。

## 使用场景

- 已有 `scripts_raw.json`，需要提炼钩子 / 结构 / 金句并写回知识库
- 典型说法：「分析脚本结构」「沉淀爆款钩子金句」「补充复刻模板」「#1 深拆」

## 不适用场景

- 尚未拉取字幕 → 先 **`yt-transcript-extract`**
- 完整调研编排（发现 → 打分 → 字幕 → 分析） → **`yt-viral-research`**

## 用到的技能 / 工具

| 工具 / 技能 | 用途 |
|------|----------|
| Agent 脚本深拆（核心） | 读 `scripts_raw.json`，提炼 hook / structure / 金句 / 深拆 |
| 本仓库 CLI `npm run youtube:research` | 刷新 HTML 报告 + 追加 `金句库.csv` |
| `references/analysis-schema.yaml` | 输出字段契约（structure / deep_dive 结构） |
| `workspace/templates/youtube-long-form-structure.yaml` | 通用结构模板（相对仓库根） |
| 下游：`create/tts-narration/yt-create` → `review:lint` → `publish` | 写 YouTube 口播稿时读 `scripts_raw.json` / HTML 报告 |

## 输入

- `$HERMES_ROOT/知识库/youtube/{topic_slug}/scripts_raw.json`（必填，已由 `yt-transcript-extract` 产出）
- `$HERMES_ROOT/知识库/youtube/{topic_slug}/ranked.json`（可选，提供排序 metadata）

## 输出

写回 **`scripts_raw.json`** 各条目：

- `structure.hook / body / cta`
- `golden_phrases[]`
- `deep_dive`：`viral_points`、`visual_style_note`、`replicability`、`suggested_owners`、`template_outline`

并可选触发金句库更新（`npm run youtube:research` 会 append `金句库.csv`）。

## Agent 必做

1. 读 `scripts_raw.json`，至少对 **#1（最爆一条）** 做深拆
2. 对 Top 5 补充 `structure` 与 `golden_phrases`（无字幕条目可基于简介推断并标注）
3. 写回 `scripts_raw.json`（保留 `timed` / `sentences` 不动）
4. 可选：执行 `npm run youtube:research -- --from ranked.json --topic {slug}` 刷新 HTML 与金句库

## Schema

见 [`references/analysis-schema.yaml`](references/analysis-schema.yaml)。
通用结构模板：`workspace/templates/youtube-long-form-structure.yaml`（相对仓库根）。

## 配置与降级

- 无需 `YOUTUBE_API_KEY`，无外部依赖（纯 Agent 分析 + 本地 CLI）。单视频「内容 + 画面级」爆款分析**完全免 Key**。
- **画面拆解（免 Key）**：除 Agent 读 `scripts_raw.json` 外，可借 TubePilot 免费工具 `get_video_frames` / `get_video_moment` / `deep_analyze_video`（已知链接即可），或本项目已有的 `crv` 逐帧视觉分析做更细的画面套路提炼。
- 无字幕条目：基于视频简介 / 画面推断结构 / 金句，并在写回时**明确标注**为推断，不冒充原文。

## 废弃（勿对用户暴露）

- `golden-phrases.jsonl`
- `analyses/*.yaml`（可作内部草稿，非主交付）
- `playbooks/*.md`（v2 以 HTML + scripts_raw 为准）

## 对话交付

分析完成后 **不贴脚本全文**；告知用户报告路径与是否已更新 `scripts_raw` / `金句库.csv`。

## 下游衔接

- 写 YouTube 口播稿：读 `scripts_raw.json` 或 HTML 报告 → `create/tts-narration/yt-create` → `review:lint` → `publish`
