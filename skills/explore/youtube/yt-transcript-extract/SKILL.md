---
name: yt-transcript-extract
description: |
  YouTube 字幕抽取技能（v2）。用 youtube-transcript-api 拉取字幕，按句重组 timed/sentences，合并进 scripts_raw.json。
  当用户要求抽 YouTube 字幕、拉 transcript、批量提取口播稿时触发。
version: 2.0.0
metadata:
  hermes:
    tags: [youtube, explore, transcript]
---

# YouTube 字幕抽取

## 配置

`workspace/references/youtube-explore-setup.md` §3（相对仓库根）

```powershell
uv pip install youtube-transcript-api
```

**不需要** `YOUTUBE_API_KEY`。

## CLI

```powershell
# 单个
npm run youtube:extract -- --video-id dQw4w9WgXcQ

# 从 ranked 批量并写入 scripts_raw.json
npm run youtube:extract -- --from "$HERMES_ROOT/知识库/youtube/{slug}/ranked.json" --merge-raw --slug {slug} --topic {slug}
```

主产出：`$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json`（含 `timed[]`、`sentences[]`）

## 失败降级

1. `youtube-transcript-api`（默认）
2. yt-dlp 字幕（CLI 内置）
3. TubePilot MCP `get_transcript`（第三备用）
4. 仍失败 → `ok: false`，HTML 报告降级为简介要点

## scripts_raw 字段

- `timed[]`：`{ t, text }` 原始 cue
- `sentences[]`：`{ start, end, text }` 按句重组
- `structure`：`{ hook, body, cta }`（CLI 初值，Agent 可精修）
- `golden_phrases[]`
