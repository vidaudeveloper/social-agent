---
name: yt-viral-research
description: |
  YouTube 发前爆款调研编排（explore）。发现 → score → 字幕 → 脚本分析，落盘 HTML + scripts_raw.json + 金句库。
  触发：「分析爆款并沉淀」「出调研报告」「金句库」「完整 YouTube 竞品调研」。
  口语：爆款深度分析、调研报告落盘、竞品脚本拆解、写稿前 YouTube 参考。
version: 2.1.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, explore, research, orchestrator]
    related_skills:
      - explore/youtube/yt-viral-discover
      - explore/youtube/yt-transcript-extract
      - explore/youtube/yt-script-analyze
      - analytics/yt-post-analytics
      - create/pipeline-orchestrator
---

# YouTube 爆款调研（编排 yt-viral-research）

## 功能概述

`explore/youtube` 的**主编排**：把三个子技能串成完整调研流水线（发现 → 分级 → 抽字幕 → 脚本分析），并落盘三件交付物（HTML 报告、`scripts_raw.json`、金句库.csv）。用于发布**之前**做竞品 / 爆款调研与知识库沉淀。

## 使用场景

- 发**之前**要做完整竞品 / 爆款调研，且必须**落盘**（HTML、`scripts_raw.json`、金句库）
- 管线 Step1 需要英文赛道参考，或用户明确要「调研报告 / 沉淀 / 金句库」
- 典型说法：「分析 YouTube 爆款并出报告」「沉淀竞品脚本」「写稿前做 YouTube 调研」

## 不适用场景

- 只要 Top 列表 / 打分、不要完整报告 → **`yt-viral-discover`**
- 查**自己频道**发后数据 → **`yt-post-analytics`**
- 只上传视频不调研 → **`yt-publish`**
- 单平台已有稿直接发布 → **`yt-publish`**，不要误进本技能

## 用到的技能 / 工具

按流水线顺序：

| 步骤 | 子技能 / 工具 | 输出 |
|------|--------------|------|
| ① 发现 | `yt-viral-discover`：免 Key 走 `seeds.json` + yt-dlp / yt-dlp 关键词（P0）；P2 可选 `YOUTUBE_API_KEY` | `raw.json` |
| ② 分级 | `npm run youtube:score` | `ranked.json` |
| ③ 抽字幕 | `yt-transcript-extract`（`youtube:extract` / `youtube:explore`） | `scripts_raw.json` |
| ④ 分析沉淀 | `yt-script-analyze`（Agent 驱动，`youtube:research` 刷新） | 写回 `scripts_raw.json` + 金句库.csv |
| ⑤ 创作（可选） | 读 `scripts_raw.json` / HTML → `create-video` → `publish` | 口播稿 / 成片 |

## 输入

- 必填：`--topic <slug>`（如 `tiktok-shop`）
- 其一：
  - 已由 TubePilot 写入的 `raw.json`（默认路径 `$HERMES_ROOT/知识库/youtube/{slug}/raw.json`），或
  - `--keyword "..."` + `--fallback`（无 Key / 无 TubePilot 时用 yt-dlp 发现），或
  - `--from <raw.json>` 指定已有原始文件
- 可选：`--top <n>`（默认 5）、`--product <name>`、`--lang`（默认 `en,en-US`）、`--min-duration` / `--max-duration`（默认 300 / 1200）

## 输出

每次调研固定 **3 件交付物**（相对 `$HERMES_ROOT/知识库/youtube/{topic_slug}/`）：

```text
{topic_slug}_爆款报告.html    # 老板/运营：横向排行图 + #1 深拆
scripts_raw.json              # AI/存档：timed + sentences + structure + 金句
ranked.json / raw.json        # 内部中间态
知识库/youtube/金句库.csv     # 全库一张表（追加去重）
```

## 命令参考

```powershell
# 一键（Agent 已存 raw.json 后）
npm run youtube:explore -- --topic tiktok-shop --top 5 --product "跨境工具"

# 无 Key / 无 TubePilot 时一键发现 + 落盘
npm run youtube:explore-full -- --topic tiktok-shop --keyword "TikTok Shop 2026" --top 5
```

分步等价流程：

```powershell
# ② 分级
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug} --top 5
# ③ 抽字幕 + 落盘
npm run youtube:extract -- --from ".../ranked.json" --merge-raw --slug {slug} --topic {slug}
# ④ 刷新 HTML + 金句库
npm run youtube:research -- --from ".../ranked.json" --topic {slug}
```

## 配置与缺 Key 策略（默认全链路免 API）

`workspace/references/youtube-explore-setup.md`（相对仓库根）：

> **关键结论**：单视频的「内容 + 画面级」爆款分析**完全不需要任何 API Key**。只有「按关键词自动搜索排名 / 评论区 / 频道级趋势监控」才需要 `YOUTUBE_API_KEY`（免费、不绑卡），属可选的 P2 增强。

- **① 发现（免 Key，默认）**：`seeds.json` 种子 + yt-dlp 硬指标，或 yt-dlp 关键词搜索；P1 可选 InnerTube trending
- **② 分级（免 Key）**：`youtube:score` 本地计算 ER / 时长过滤
- **③ 单视频分析（免 Key）**：TubePilot 免费工具（见下）+ `crv` 逐帧 + `faster-whisper` 转写兜底
- **④ 报告（免 Key）**：本地 `qwen` / `llama3` 汇总，或 Agent 驱动 + HTML 模板
- **（P2 可选）搜索排名 / 评论区 / 频道趋势**：再补 `YOUTUBE_API_KEY` + TubePilot 扩展工具

**③ 单视频深度分析可用的 TubePilot 免 Key 工具（MCP 版 `npx -y tubepilot`）：**

| 工具 | 作用 | 分析维度 |
|------|------|----------|
| `get_video_info` | 标题/简介/频道/时长/关键词 | 元数据 |
| `get_transcript` / `list_caption_languages` | 字幕（先查语言） | 脚本拆解 |
| `get_video_frames` / `get_frame_at_time` | 抽帧 / 指定时刻截图 | **画面拆解** |
| `get_video_moment` / `video_timeline` | 帧+字幕联合 / 时间线总览 | 图文结合 |
| `get_video_summary` / `get_video_outline` / `convert_to_notes` | 概要/大纲/笔记 | 内容归纳 |
| `deep_analyze_video` | 综合剖析（info+字幕+章节+帧） | **一键分析** |
| `analyze_short` | Shorts 专项 | 短视频 |

> 字幕类工具要求视频已开启 captions；无字幕视频走 `get_video_frames`（视觉）或本地 `faster-whisper` 转写补齐。
> 注意区分 **42.uk 网页版 TubePilot**（无 Key 时数据为 AI 估算，不准）——请用 **MCP 版**。

**缺 Key 时禁止说「TubePilot 完全不能用」**；按 `yt-viral-discover` 的兜底：seeds / `--fallback` → 用户贴链接 → 再引导申请 Key（仅 P2）。

## 选题规则

遵循 `workspace/references/topic-research-diversity.md`（相对仓库根）。

## 对话交付规范（必遵）

管线跑完后，**对话里只交付两件事**：

1. **HTML 报告** — 用 `open_resource` 打开 `{topic_slug}_爆款报告.html`；回复 **1–2 句结论**
2. **知识库路径清单**：

```text
知识库已更新：
- 报告：$HERMES_ROOT/知识库/youtube/{slug}/{slug}_爆款报告.html
- 原始脚本：.../scripts_raw.json
- 金句库：.../知识库/youtube/金句库.csv
```

**禁止**在对话里贴长表格、全文脚本、JSON 内容。用户需要原始数据时自行打开路径。

## 下游衔接

- 写 YouTube 口播稿：读 `scripts_raw.json` / HTML → `create/tts-narration/yt-create` → `review:lint` → `publish`
