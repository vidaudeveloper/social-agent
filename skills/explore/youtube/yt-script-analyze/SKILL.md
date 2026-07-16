---
name: yt-script-analyze
description: |
  YouTube 脚本分析与知识库沉淀（v2）。读 scripts_raw.json，提炼钩子/结构/金句与 #1 深拆，写回知识库。
  当用户要求分析脚本结构、沉淀爆款钩子金句、补充复刻模板时触发。
version: 2.0.0
metadata:
  hermes:
    tags: [youtube, explore, analyze, knowledge-base]
---

# YouTube 脚本分析 + 知识库沉淀（v2）

## 输入

- `$HERMES_ROOT/知识库/youtube/{topic_slug}/scripts_raw.json`
- `$HERMES_ROOT/知识库/youtube/{topic_slug}/ranked.json`（可选，metadata）

## 输出

写回 **`scripts_raw.json`** 各条目的：

- `structure.hook / body / cta`
- `golden_phrases[]`
- `deep_dive`：`viral_points`、`visual_style_note`、`replicability`、`suggested_owners`、`template_outline`

并触发金句库更新（`npm run youtube:research` 会 append `金句库.csv`）。

## Schema

见 [`references/analysis-schema.yaml`](references/analysis-schema.yaml)

通用结构模板：`workspace/templates/youtube-long-form-structure.yaml`（相对仓库根）

## Agent 必做

1. 读 `scripts_raw.json`，至少对 **#1（最爆一条）** 做深拆
2. 对 Top 5 补充 `structure` 与 `golden_phrases`（无字幕条目可基于简介推断并标注）
3. 写回 `scripts_raw.json`（保留 `timed` / `sentences` 不动）
4. 可选：执行 `npm run youtube:research -- --from ranked.json --topic {slug}` 刷新 HTML

## 废弃（勿对用户暴露）

- `golden-phrases.jsonl`
- `analyses/*.yaml`（可作内部草稿，非主交付）
- `playbooks/*.md`（v2 以 HTML + scripts_raw 为准）

## 下游

写 YouTube 口播稿时读 `scripts_raw.json` 或 HTML 报告 → `create/tts-narration/yt-create` → `review:lint` → publish

## 对话交付

分析完成后 **不贴脚本全文**；告知用户报告路径与是否已更新 `scripts_raw` / `金句库.csv`。
