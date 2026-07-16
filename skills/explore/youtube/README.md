# YouTube Explore — 爆款调研（v2 · 免 API 优先）

发布**之前**：YouTube Long-form（5–20min）爆款发现、字幕抽取、脚本分析与知识库沉淀。

> **免 API 结论**：单视频的「内容 + 画面级」爆款分析**完全不需要任何 API Key**（TubePilot MCP 免费工具 + crv + faster-whisper + 本地 qwen）。只有「按关键词自动搜索排名 / 评论区 / 频道级趋势监控」才需要 `YOUTUBE_API_KEY`（免费、不绑卡），属可选 P2 增强。发现阶段默认免 Key：**InnerTube 热门榜（`--trending`，自动拿榜单）+ `seeds.json` 种子（运营圈定竞品）+ yt-dlp 硬指标**。详见 [`yt-viral-discover`](yt-viral-discover/SKILL.md) 的「分场景决策表」。

- **配置（唯一入口）**：[`workspace/references/youtube-explore-setup.md`](../../../workspace/references/youtube-explore-setup.md)
- 主题：`explore`（发前调研，不自动 publish）；与发后复盘 `analytics/yt-post-analytics` 区分。

## 技能总览

本模块由 1 个编排技能 + 3 个子技能组成：

| 技能 | 定位 | 功能 | 用到的工具 / 技能 | 输入 | 输出 |
|------|------|------|-------------------|------|------|
| [`yt-viral-research/`](yt-viral-research/SKILL.md) | 编排 | 发现→分级→字幕→分析，落盘完整报告 | `yt-viral-discover` + `yt-transcript-extract` + `yt-script-analyze` + 各 npm 脚本 | `--topic` + `raw.json`（或 `--seeds` / `--keyword --fallback`） | HTML 报告 + `scripts_raw.json` + `金句库.csv` |
| [`yt-viral-discover/`](yt-viral-discover/SKILL.md) | 子技能① | 爆款发现 + ER 分级（只发现不沉淀） | 免 Key：`seeds.json` + yt-dlp / yt-dlp 关键词；P2 可选 TubePilot 扩展工具；`youtube:score` | 种子 / 关键词 / 竞品频道 → `raw.json` | `raw.json` + `ranked.json` |
| [`yt-transcript-extract/`](yt-transcript-extract/SKILL.md) | 子技能② | 字幕抽取 + 按句重组 | `youtube-transcript-api`（默认）→ yt-dlp → TubePilot `get_transcript`（均免 Key） | 视频 ID / `ranked.json` | `scripts_raw.json`（timed + sentences） |
| [`yt-script-analyze/`](yt-script-analyze/SKILL.md) | 子技能③ | 脚本深拆：钩子/结构/金句写回 | Agent 分析驱动 + `youtube:research`；画面可借 TubePilot `get_video_frames` / `get_video_moment`（免 Key） | `scripts_raw.json` | 写回 `scripts_raw.json` + `金句库.csv` |

> 日常使用优先走 **`yt-viral-research`**（编排）；三个子技能在只需单步（只发现 / 只抽字幕 / 只深拆）时单独调用。

## CLI

```powershell
# 推荐（免 API · 自动热门榜）：InnerTube browse 直连，零个人 Key，可指定区域/分类
npm run youtube:explore-trending -- --topic tiktok-shop --region US --category all --top 5 --product "跨境工具"

# 运营圈定种子（竞品频道/爆款样本）→ yt-dlp 取硬指标
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic tiktok-shop --top 5 --product "跨境工具"

# 免 API 关键词兜底（yt-dlp 搜索）
npm run youtube:explore-full -- --topic tiktok-shop --keyword "TikTok Shop seller guide 2026" --top 5

# 已有 raw.json（Agent 已存 / 来自上方任一路）时跑完整管线
npm run youtube:explore -- --topic tiktok-shop --top 5 --product "跨境工具"

# 子命令（调试）
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/tiktok-shop/raw.json" --topic tiktok-shop --top 5
npm run youtube:extract -- --from "$HERMES_ROOT/知识库/youtube/tiktok-shop/ranked.json" --merge-raw --slug tiktok-shop
npm run youtube:research -- --from "$HERMES_ROOT/知识库/youtube/tiktok-shop/ranked.json" --topic tiktok-shop
```

## 产出目录（v2 契约）

每次调研一个话题，固定 **3 件交付物**：

```text
$HERMES_ROOT/知识库/youtube/{topic_slug}/
├── {topic_slug}_爆款报告.html    # 老板/运营：横向排行图 + #1 深拆
├── scripts_raw.json              # AI/存档：timed + sentences + structure + 金句
└── ranked.json / raw.json        # 内部中间态

$HERMES_ROOT/知识库/youtube/金句库.csv   # 全库一张表（追加去重）
```

**Agent 对话交付**：只输出 HTML 报告路径 + 1–2 句结论 + 知识库路径清单；不贴 JSON / 长脚本。
