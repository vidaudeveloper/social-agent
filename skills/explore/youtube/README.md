# YouTube Explore — 爆款调研（v2）

发之前：YouTube Long-form（5–20min）爆款发现、字幕抽取、脚本分析与知识库沉淀。

**配置（唯一入口）**：[`workspace/references/youtube-explore-setup.md`](../../../workspace/references/youtube-explore-setup.md)

## 技能

| 技能 | 说明 |
|------|------|
| [`yt-viral-discover/`](yt-viral-discover/SKILL.md) | ① TubePilot MCP 搜爆款 → 存 `raw.json` |
| [`yt-transcript-extract/`](yt-transcript-extract/SKILL.md) | ② `youtube-transcript-api` 抽字幕 + 按句重组 |
| [`yt-script-analyze/`](yt-script-analyze/SKILL.md) | ③ 结构/钩子/金句 → 补充 `scripts_raw` + #1 深拆 |
| [`yt-viral-research/`](yt-viral-research/SKILL.md) | 编排 ①→②→③ |

## CLI

```powershell
# 推荐：完整管线（TubePilot raw 已由 Agent 写入话题目录）
npm run youtube:explore -- --topic tiktok-shop --keyword "TikTok Shop seller guide 2026" --top 5 --product "跨境工具"

# yt-dlp 补位（无 TubePilot 时）
npm run youtube:explore-full -- --topic tiktok-shop --keyword "TikTok Shop seller guide 2026" --top 5

# 子命令（调试）
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/tiktok-shop/raw.json" --topic tiktok-shop --top 5
npm run youtube:extract -- --from "$HERMES_ROOT/知识库/youtube/tiktok-shop/ranked.json" --merge-raw --slug tiktok-shop
npm run youtube:research -- --from "$HERMES_ROOT/知识库/youtube/tiktok-shop/ranked.json" --topic tiktok-shop
```

## 产出目录（v2 契约）

每次爬取一个话题，固定 **3 件交付物**：

```text
$HERMES_ROOT/知识库/youtube/{topic_slug}/
├── {topic_slug}_爆款报告.html    # 老板/运营：横向排行图 + #1 深拆
├── scripts_raw.json              # AI/存档：timed + sentences + structure + 金句
└── ranked.json / raw.json        # 内部中间态

$HERMES_ROOT/知识库/youtube/金句库.csv   # 全库一张表（追加去重）
```

**Agent 对话交付**：只输出 HTML 报告路径 + 1–2 句结论 + 知识库路径清单；不贴 JSON/长脚本。
