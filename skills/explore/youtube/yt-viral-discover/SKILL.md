---
name: yt-viral-discover
description: |
  YouTube 发前爆款发现（explore）。TubePilot 搜索/热点 + score 分级，产出 Top 列表与 ER 分级、Long-form 5–20min 过滤。
  触发：「YouTube 爆款 Top」「赛道热门」「竞品频道视频列表」「只要发现不要完整报告」。
  口语：分析 YouTube 爆款视频数据、分析爆款视频列表、看哪些视频火、赛道 Top、竞品频道数据。
version: 2.1.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [youtube, explore, viral, discover]
    related_skills:
      - explore/youtube/yt-viral-research
      - analytics/yt-post-analytics
---

# YouTube 爆款发现（yt-viral-discover）

## 功能概述

在**发布之前**发现赛道 / 竞品里表现好的 YouTube 视频，给出 Top 列表与 ER（互动率）分级，并按 Long-form（5–20 分钟）做时长过滤。本技能只负责「发现 + 打分」，不生成完整调研报告、不写金句库、不发布。

## 使用场景

- 想看某关键词赛道 / 竞品频道哪些视频表现好，需要 Top 列表、ER 分级、Long-form 过滤
- 用户只要「发现 / 列表 / 打分」，尚未要求 HTML 报告、金句库、完整沉淀
- 典型说法：「YouTube 爆款 Top」「赛道热门视频」「竞品频道哪些视频火」

## 不适用场景

- 要完整调研报告 + `scripts_raw.json` + 金句库 → **`yt-viral-research`**
- 查**自己频道**发后播放 / Analytics → **`yt-post-analytics`**
- 上传 / 发布 MP4 → **`yt-publish`**
- 从选题到多平台发布 → **`pipeline-orchestrator`**（本技能只是其中 explore 一步）
- 用户**已有视频链接**，只要字幕 / 摘要 / 抽帧 → 直接用 TubePilot **免费工具**或 `yt-transcript-extract`，**不要求** API Key

## 用到的技能 / 工具

| 工具 / 技能 | 用途 | 是否需要 Key |
|------|----------|--------------|
| **免 Key 发现（默认 MVP）** | | |
| `npm run youtube:explore-trending -- --region US --category all --topic {slug}` | **InnerTube `browse` 直连热门/分类榜，零个人 Key（自动发现）** | **否** |
| `npm run youtube:explore-seeds -- --seeds config/seeds.json --topic {slug}` | 读运营圈定的频道/视频种子（竞品追踪），yt-dlp 取硬指标 | **否** |
| `npm run youtube:explore-full -- --keyword "..." --top 5` | yt-dlp 关键词搜索兜底 | **否** |
| **已知链接分析（免 Key）** | | |
| TubePilot `get_video_info` / `get_transcript` / `get_video_frames` / `get_video_moment` / `deep_analyze_video` | 已知链接的简介 / 字幕 / 帧 / 综合剖析 | **否** |
| `npm run youtube:score` | ER 分级 / 5–20min 过滤 | 否 |
| **增强发现（P2，可选）** | | |
| TubePilot `search_videos` / `get_trending` / `get_video_details` / `compare_videos` / `get_channel_videos` | 关键词搜索 / 热点 / 官方统计 / 频道列表 | 要 `YOUTUBE_API_KEY`（免费不绑卡） |

> **TubePilot ≠ 全程要 Key。** 使用 **MCP 版** `npx -y tubepilot`（ixex，MIT）：27 个基础工具（已知链接的简介/字幕/抽帧/摘要/综合剖析）**免 Key**；仅 22 个扩展工具（搜索/热点/官方统计/频道）要 Key。注意区分 **42.uk 网页版 TubePilot**（无 Key 时数据为 AI 估算，不准，不要误用）。

## 输入

- 关键词 或 竞品频道标识（由此得到 `topic_slug`）
- **免 Key（默认）**：`--trending`（InnerTube 热门榜，自动发现）/ `seeds.json` 种子（竞品频道/视频）/ yt-dlp 关键词搜索，由脚本生成 `raw.json`
- **（P2 可选）有 Key 时**：TubePilot 搜索 / 详情结果，由 Agent 存入 `raw.json`
- 用户贴出的视频链接 / 手工整理列表，亦可写入 `raw.json` 后再 `score`

## 输出

固定落盘到知识库（相对 `$CONTENT_ROOT/知识库/youtube/{topic_slug}/`）：

- `raw.json` — 发现结果（seeds / yt-dlp / TubePilot 任一来源）
- `ranked.json` — 经 `youtube:score` 分级后的 Top 列表（含 `gradeLabel`、ER、时长过滤）

## 命令参考

```powershell
# ① 有 Key：先由 Agent 用 TubePilot 搜索并写入 raw.json，再做分级
npm run youtube:score -- --in "$CONTENT_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug} --top 5

# ② 无 Key：yt-dlp 兜底发现（需 --keyword）
npm run youtube:explore-full -- --topic {slug} --keyword "TikTok Shop seller guide 2026" --top 5

# 若用户还要完整报告：继续 npm run youtube:explore -- --topic {slug} 或切换 yt-viral-research
```

## 配置与降级

配置详见 `workspace/references/youtube-explore-setup.md`（相对仓库根）。

**本技能默认免 API（P0）**，发现走 InnerTube 热门榜 / 种子 / yt-dlp，全程不申请 Key：

1. **自动热门榜（推荐，P1）**：`npm run youtube:explore-trending -- --topic {slug} --region US --category all` —— InnerTube `browse` 直连热门/分类榜，**零个人 Key**，自动发现赛道爆款，产出 `raw.json`。
2. **运营圈定种子（竞品追踪）**：`npm run youtube:explore-seeds -- --seeds config/seeds.json --topic {slug}` —— 读频道/视频种子，yt-dlp 取播放/点赞硬指标。
3. **关键词兜底**：`npm run youtube:explore-full -- --topic {slug} --keyword "..." --top 5` —— yt-dlp 关键词搜索。
4. **已知链接直接分析**：用户贴链接 → `yt-transcript-extract`（含 whisper）+ `yt-script-analyze`（**crv** 画面）；TubePilot 可选，400 跳过。
5. **（P2 可选）要关键词级搜索排名 / 评论区 / 频道趋势**：再补 `YOUTUBE_API_KEY`，启用 TubePilot 扩展工具。

> 注意：yt-dlp / InnerTube 属非官方接口，生产环境需加重试与频率控制（建议 ≤ 5 req/10s/IP）。

## 分场景决策表（免 API 视角）

| 场景 | 推荐方案 | 需要 API Key？ |
|------|----------|----------------|
| 拆单条对标：字幕/脚本 | youtube-transcript-api → yt-dlp → **faster-whisper** | **否** |
| 拆单条对标：画面 | **crv** 逐帧（输出 Temp）；TubePilot 画面可选且失败忽略 | **否** |
| 自动发现赛道热门 / 分类榜 | InnerTube `--trending` | **否** |
| 圈定样本筛选 / 排名 | `seeds.json` + yt-dlp 硬指标 | **否** |
| 按关键词发现新选题 | yt-dlp `--fallback` | **否** |
| 关键词级搜排名 / 评论区 / 频道监控 | YouTube Data API v3（P2） | 是 |

## 默认过滤

- 时长：5–20 分钟（300–1200 秒）
- 主分析对象：Long-form 横版科普 / 测评

## 业务分级（score 输出 `gradeLabel`）

- **真爆款**：S 级高 ER + 高播放
- **流量型**：A 级大盘播放、ER 相对偏低
- **潜力型**：上升速度快的 A/B
- 字母等级 S/A/B/C 仍用于排序

## 对话交付

- 只汇报 Top 列表结论（1–2 句）+ 关键落盘路径；不贴长表格。
- 若用户只要分析已有链接，直接走免费工具，不要因缺 Key 拒绝或停死。

## 下游衔接

- 完整调研（含 crv + **CLI 报告**）→ **`yt-viral-research`**（禁止手写 HTML）
- 抽字幕 / whisper → **`yt-transcript-extract`**
- 查自己频道发后数据 → **`yt-post-analytics`**
