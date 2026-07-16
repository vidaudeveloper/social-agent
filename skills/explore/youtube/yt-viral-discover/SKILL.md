---
name: yt-viral-discover
description: |
  YouTube 发前爆款发现（explore）。TubePilot 搜索/热点 + score 分级，产出 Top 列表与 ER 分级。
  触发：「YouTube 爆款 Top」「赛道热门」「竞品频道视频列表」「只要发现不要完整报告」。
  口语：分析爆款视频列表、看哪些视频火、赛道 Top、竞品频道数据。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [youtube, explore, viral, discover]
    related_skills:
      - explore/youtube/yt-viral-research
      - analytics/yt-post-analytics
---

# YouTube 爆款发现

## When to use

- 发**之前**看赛道/竞品哪些视频表现好，需要 Top 列表、ER 分级、Long-form 过滤
- 用户只要「发现 / 列表 / 打分」，尚未要求 HTML 报告、金句库、完整沉淀
- 典型说法：「YouTube 爆款 Top」「赛道热门视频」「竞品频道哪些视频火」

## When not to use

- 要完整调研报告 + `scripts_raw.json` + 金句库 → **`yt-viral-research`**
- 查**自己频道**发后播放/Analytics → **`yt-post-analytics`**
- 上传/发布 MP4 → **`yt-publish`**
- 从选题到多平台发布 → **`pipeline-orchestrator`**（本技能只是其中 explore 一步）

## 配置

**必须先读**：`workspace/references/youtube-explore-setup.md`（相对仓库根）

- TubePilot MCP 需配置 `YOUTUBE_API_KEY`
- 缺 key 时停止，引导用户自行申请

## 技能边界

| 步骤 | 执行方式 |
|------|----------|
| 搜索 / 热点 / 详情 | **TubePilot MCP**（`search_videos`、`get_trending`、`get_video_details` 等） |
| ER 分级 / 5–20min 过滤 | **本仓库 CLI**：`npm run youtube:score` |
| yt-dlp 补位 | 仅 `npm run youtube:explore-full -- --fallback`（非主路径） |
| 发布 | **不走本技能** → `publish/youtube` sau |

## TubePilot 工具映射

| 场景 | MCP 工具 |
|------|----------|
| 关键词搜视频 | `search_videos` |
| 区域热点 | `get_trending` |
| 单条统计 | `get_video_details` |
| 多条对比 | `compare_videos` |
| 竞品频道 | `get_channel_videos` / `analyze_channel` |

## 工作流程

1. 确认关键词或竞品频道（得到 `topic_slug`）
2. 调用 TubePilot MCP 获取结果
3. 将 JSON 保存到 **`$HERMES_ROOT/知识库/youtube/{topic_slug}/raw.json`**
4. 执行分级：

```powershell
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug} --top 5
```

5. 继续管线：`npm run youtube:explore -- --topic {slug}`

## 默认过滤

- 时长：5–20 分钟（300–1200 秒）
- 主分析对象：Long-form 横版科普/测评

## 业务分级（score 输出 `gradeLabel`）

- **真爆款**：S 级高 ER + 高播放
- **流量型**：A 级大盘播放、ER 相对偏低
- **潜力型**：上升速度快的 A/B
- 字母等级 S/A/B/C 仍用于排序
