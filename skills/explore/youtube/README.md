# YouTube Explore — 爆款调研（v2.2 · crv + whisper + CLI 报告）

发布**之前**：YouTube Long-form 爆款发现、字幕/转写、**crv 画面**、脚本分析与知识库沉淀。

> **架构（已拍板）**  
> ①② 发现/筛爆款：`seeds` / `--trending` + yt-dlp  
> ③a 字幕：youtube-transcript-api → yt-dlp → **faster-whisper**  
> ③b 画面：**crv（claude-real-video）** 逐帧  
> ④ 报告：**仅 CLI**（`youtube:research` / explore 管线）——**禁止 Agent 手写 HTML**

配置：[`workspace/references/youtube-explore-setup.md`](../../../workspace/references/youtube-explore-setup.md)

## 技能总览

| 技能 | 定位 | 输入 | 输出 |
|------|------|------|------|
| [`yt-viral-research/`](yt-viral-research/SKILL.md) | 编排 | topic + seeds/trending/raw | CLI HTML + scripts_raw + 金句库 |
| [`yt-viral-discover/`](yt-viral-discover/SKILL.md) | ①② | seeds / keyword / trending | raw.json + ranked.json |
| [`yt-transcript-extract/`](yt-transcript-extract/SKILL.md) | ③a | videoId / ranked | scripts_raw（timed+sentences） |
| [`yt-script-analyze/`](yt-script-analyze/SKILL.md) | ③b+深拆 | scripts_raw | 写回 deep_dive（含 crv）后 **必跑 research** |

日常优先 **`yt-viral-research`**。

## CLI

```powershell
npm run youtube:explore-trending -- --topic tiktok-shop --region US --top 5
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic tiktok-shop --top 5
npm run youtube:explore-full -- --topic tiktok-shop --keyword "..." --top 5
npm run youtube:explore -- --topic tiktok-shop --top 5 --product "跨境工具"

npm run youtube:extract -- --from ".../ranked.json" --merge-raw --slug tiktok-shop --lang zh,zh-Hans,en
# 深拆写回 scripts_raw 后 —— 必须：
npm run youtube:research -- --from ".../ranked.json" --topic tiktok-shop
```

## 产出契约

```text
$CONTENT_ROOT/知识库/youtube/{topic_slug}/
├── {topic_slug}_爆款报告.html    # 仅 CLI（含 Chart.js +「爆款方法论」）
├── scripts_raw.json              # timed + sentences + structure + crv 画面
└── ranked.json / raw.json

$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}/   # 字幕/转写缓存（音频 + transcript.json）
$CONTENT_ROOT/知识库/youtube/_downloads/{videoId}/ # crv 用本地 mp4
$CONTENT_ROOT/知识库/youtube/金句库.csv
```

**Agent 对话**：只交 HTML 路径 + 1–2 句结论 + 路径清单。  
**禁止**手写/覆盖 HTML；交付前自检 Chart.js +「爆款方法论」。
