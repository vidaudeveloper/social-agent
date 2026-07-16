---
name: yt-viral-research
description: |
  YouTube 发前爆款调研编排（explore）。发现 → score → 字幕 → 脚本分析，落盘 HTML + scripts_raw.json + 金句库。
  触发：「分析爆款并沉淀」「出调研报告」「金句库」「完整 YouTube 竞品调研」。
  口语：爆款深度分析、调研报告落盘、竞品脚本拆解、写稿前 YouTube 参考。
version: 2.0.0
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

# YouTube 爆款调研（编排 v2）

## When to use

- 发**之前**要做完整竞品/爆款调研，且必须**落盘**（HTML、`scripts_raw.json`、金句库）
- 管线 Step 1 需要英文赛道参考，或用户明确要「调研报告 / 沉淀 / 金句库」
- 典型说法：「分析 YouTube 爆款并出报告」「沉淀竞品脚本」「写稿前做 YouTube 调研」

## When not to use

- 只要 Top 列表/打分、不要完整报告 → **`yt-viral-discover`**
- 查**自己频道**发后数据 → **`yt-post-analytics`**
- 只上传视频不调研 → **`yt-publish`**
- 单平台已有稿直接发布 → **`yt-publish`**，不要误进本技能

## 配置

`workspace/references/youtube-explore-setup.md`（相对仓库根）

## 端到端流程

```text
① TubePilot MCP（search_videos / get_video_details）
        ↓ 存 $HERMES_ROOT/知识库/youtube/{slug}/raw.json
② npm run youtube:score --topic {slug}
        ↓ ranked.json
③ npm run youtube:explore --topic {slug}  （或 extract + research）
        ↓ scripts_raw.json + HTML + 金句库.csv
④ Agent yt-script-analyze（补充 #1 深拆 / 金句 / 复刻模板）
```

一键（Agent 已存 raw.json 后）：

```powershell
npm run youtube:explore -- --topic tiktok-shop --top 5 --product "跨境工具"
```

yt-dlp 补位（无 TubePilot）：

```powershell
npm run youtube:explore-full -- --topic tiktok-shop --keyword "TikTok Shop 2026" --top 5
```

## 步骤详解

### Step 1 — 发现（TubePilot MCP）

按 `yt-viral-discover`（`skills/explore/youtube/yt-viral-discover/`）调用 MCP，保存：

`$HERMES_ROOT/知识库/youtube/{topic_slug}/raw.json`

### Step 2 — 分级

```powershell
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug} --top 5
```

### Step 3 — 抽字幕 + 落盘

```powershell
npm run youtube:explore -- --topic {slug}
```

或分步：

```powershell
npm run youtube:extract -- --from ".../ranked.json" --merge-raw --slug {slug} --topic {slug}
npm run youtube:research -- --from ".../ranked.json" --topic {slug}
```

### Step 4 — 分析沉淀（Agent）

切换 `yt-script-analyze`（`skills/explore/youtube/yt-script-analyze/`），读 `scripts_raw.json`，为 Top 5（至少 #1）补充：

- `structure.hook / body / cta`
- `golden_phrases[]`
- `deep_dive`（爆点、能否复刻、负责人、模板、画面风格）

写回 `scripts_raw.json`，必要时重新生成 HTML（`npm run youtube:research`）。

### Step 5 — 创作（可选）

读 `scripts_raw.json` / HTML 报告 → 写口播稿 → `create-video` → publish

## Agent 对话交付规范（必遵）

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

## 选题规则

遵循 `workspace/references/topic-research-diversity.md`（相对仓库根）。
