---
name: yt-viral-research
description: |
  YouTube 发前爆款调研编排（explore）。发现 → score → 字幕/whisper → crv 画面 → 脚本分析，落盘 HTML + scripts_raw.json + 金句库。
  触发：「分析爆款并沉淀」「出调研报告」「金句库」「完整 YouTube 竞品调研」。
  口语：分析 YouTube 爆款视频数据、爆款深度分析、调研报告落盘、竞品脚本拆解、写稿前 YouTube 参考。
version: 2.2.0
author: social-agent
license: MIT
metadata:
  vidau:
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

`explore/youtube` 的**主编排**：发现 → 分级 → 抽字幕（失败则 whisper）→ **crv 逐帧画面** → 脚本深拆 → **CLI 生成 HTML**。用于发布**之前**做竞品 / 爆款调研与知识库沉淀。

## 使用场景

- 发**之前**要做完整竞品 / 爆款调研，且必须**落盘**（HTML、`scripts_raw.json`、金句库）
- 管线 Step1 需要英文赛道参考，或用户明确要「调研报告 / 沉淀 / 金句库」

## 不适用场景

- 只要 Top 列表 / 打分、不要完整报告 → **`yt-viral-discover`**
- 查**自己频道**发后数据 → **`yt-post-analytics`**
- 只上传视频不调研 → **`yt-publish`**

## 流水线（必遵）

| 步骤 | 子技能 / 工具 | 输出 |
|------|--------------|------|
| ① 发现 | `yt-viral-discover`：seeds / `--trending` / yt-dlp | `raw.json` |
| ② 分级 | `npm run youtube:score` + yt-dlp 硬指标 | `ranked.json` |
| ③a 字幕 | `yt-transcript-extract`：官方字幕 → yt-dlp → **faster-whisper** | `scripts_raw.json`（`timed`+`sentences`） |
| ③b 画面 | `yt-script-analyze`：**crv** 逐帧（Top1 必做，建议 Top3） | 写回 `deep_dive.visual_*` |
| ④ 报告 | **仅** `npm run youtube:research`（或 explore 管线内同逻辑） | `{slug}_爆款报告.html` + `金句库.csv` |

```text
seeds/trending + yt-dlp → score → extract(captions|whisper) → crv → 写 scripts_raw → youtube:research
```

## 报告生成硬约束（必遵 · 禁止手写）

**唯一合法报告生成方式**（深拆写回 `scripts_raw.json` **之后必须执行**）：

```powershell
npm run youtube:research -- --from "$CONTENT_ROOT/知识库/youtube/{slug}/ranked.json" --topic {slug} --product "..."
```

以下命令内部同样调用 `report-boss-html.mjs`，也合法：

```powershell
npm run youtube:explore -- --topic {slug}
npm run youtube:explore-seeds -- --seeds ... --topic {slug}
npm run youtube:explore-trending -- --topic {slug}
```

### 禁止（违反 = 交付不合格）

- **禁止**用 `Write` / 编辑器手写、覆盖 `{slug}_爆款报告.html`
- **禁止**自创 CSS/版式的「另一份报告」充当交付物
- **禁止**在对话里贴长表格、全文脚本、JSON

### Agent 职责边界

- Agent **只改** `scripts_raw.json`（structure / golden_phrases / deep_dive）
- HTML **只许 CLI**（`report-boss-html.mjs`）生成

### 交付前自检

打开报告文件，须同时满足：

1. 含 Chart.js CDN（`cdn.jsdelivr.net/npm/chart.js`）
2. 含文案「爆款方法论」

任一缺失 → **视为未完成**，必须重跑 `npm run youtube:research`，不得手补 HTML。

## 输入

- 必填：`--topic <slug>`
- 其一：`raw.json` / `--seeds` / `--trending` / `--keyword --fallback`
- 可选：`--top`、`--product`、`--lang`（中文话题建议 `zh,zh-Hans,en`）

## 输出

```text
$CONTENT_ROOT/知识库/youtube/{topic_slug}/
├── {topic_slug}_爆款报告.html    # 仅 CLI 生成
├── scripts_raw.json              # timed + sentences + structure + 金句 + crv 画面
├── ranked.json / raw.json
$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}/   # 字幕缓存
$CONTENT_ROOT/知识库/youtube/_downloads/{videoId}/ # crv 用 mp4
知识库/youtube/金句库.csv
```

## 命令参考

```powershell
# 免 API：热门榜 / 种子
npm run youtube:explore-trending -- --topic tiktok-shop --region US --top 5
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic tiktok-shop --top 5

# 已有 raw 后一键（字幕含 whisper 兜底 + HTML）
npm run youtube:explore -- --topic tiktok-shop --top 5 --product "跨境工具"

# 深拆写回 scripts_raw 后 —— 必须再跑（刷新 HTML）
npm run youtube:research -- --from "$CONTENT_ROOT/知识库/youtube/{slug}/ranked.json" --topic {slug}
```

## 配置与工具策略

详见 `workspace/references/youtube-explore-setup.md`。

| 阶段 | 主工具 | 说明 |
|------|--------|------|
| ①② | seeds / trending + yt-dlp | 免 Key |
| ③a 字幕 | youtube-transcript-api → yt-dlp → **faster-whisper** | TubePilot 非必经；400 跳过 |
| ③b 画面 | **crv（claude-real-video）** | 主路径；输出目录用 Temp |
| ④ 报告 | **CLI only** | 禁止手写 HTML |
| P2 | TubePilot + `YOUTUBE_API_KEY` | 仅关键词搜/评论区/频道监控 |

**禁止**因 TubePilot 400 中断全链路；字幕走 whisper，画面走 crv。

## 选题规则

遵循 `workspace/references/topic-research-diversity.md`。

## 对话交付规范（必遵）

1. 用 `open_resource` 打开 **CLI 生成的** `{slug}_爆款报告.html`；回复 **1–2 句结论**
2. 知识库路径清单：

```text
知识库已更新：
- 报告：$CONTENT_ROOT/知识库/youtube/{slug}/{slug}_爆款报告.html
- 原始脚本：.../scripts_raw.json
- 金句库：.../知识库/youtube/金句库.csv
```

## 下游衔接

- 写 YouTube 口播稿：读 `scripts_raw.json` / HTML → `create/tts-narration/yt-create` → `review:lint` → `publish`
