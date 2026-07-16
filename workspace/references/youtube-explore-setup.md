# YouTube Explore 配置（爆款调研 + 字幕抽取）

> explore 层 YouTube 能力：发现（seeds/yt-dlp，免 Key）→ 本地 CLI 分级 → 字幕/画面抽取（TubePilot 免费工具 / youtube-transcript-api / crv）→ 知识库沉淀。  
> **publish** 上传仍走 sau，见 [`skills/publish/youtube/references/sau-runbook.md`](../../skills/publish/youtube/references/sau-runbook.md)。

---

## 0. 免 API 结论（先读）

> **单视频的「内容 + 画面级」爆款分析完全不需要任何 API Key。** 只有「按关键词自动搜索排名 / 评论区 / 频道级趋势监控」才需要 `YOUTUBE_API_KEY`（免费、不绑卡），属可选 P2 增强。

| 能力 | 免 Key 可行 | 首选工具 |
|------|:-----------:|----------|
| 视频元数据（标题/简介/时长/封面） | ✅ | yt-dlp / TubePilot / InnerTube |
| 字幕 / 转写 | ✅ | TubePilot `get_transcript` / youtube-transcript-api / faster-whisper |
| 关键帧 / 画面 | ✅ | TubePilot `get_video_frames` / `get_video_moment` / crv |
| 播放量 / 点赞数（精确） | ✅ | **yt-dlp** |
| 综合分析 / 概要 / 笔记 | ✅ | TubePilot `deep_analyze_video` + 本地 LLM |
| 多视频爆点对比 | ✅ | TubePilot `compare_moments` / yt-dlp 批量 |
| 关键词搜索选题 / 评论区 / 频道趋势 | ⚠️ | YouTube Data API v3（免费不绑卡，P2） |

**完整免 API 链路**：`InnerTube 热门榜(--trending) / seeds.json / yt-dlp → yt-dlp 取硬指标 → TubePilot 免费工具 + crv/whisper 拆内容 → 本地 qwen 汇总报告`

## 1. YOUTUBE_API_KEY（仅 P2 增强需要）

### ⚠️ 两个同名 TubePilot，结论完全不同

| 产品 | 形态 | 是否必须 API Key | 说明 |
|------|------|------------------|------|
| **`tubepilot` (ixex) — MCP Server** | `npx -y tubepilot` | **否**（基础功能） | 27 个基础工具免 Key，22 个扩展工具才需 Key。**本仓库使用此版本。** |
| **42.uk TubePilot** | 网页版工具 | 是 | 未配置 Key 时数据为「AI 估算（inaccurate）」，需自填 Key。**不要误用。** |

> 团队「需要 API」的说法，大概率源于误用了 42.uk 网页版。改用 MCP 版即可绕开该限制。

**常见误解**：没有 Key ≠ TubePilot 完全不能用。MCP 版约 27 个免费工具（已知链接的简介/字幕/抽帧/摘要/综合剖析）**不需要** Key；约 22 个扩展工具（搜索/热点/官方统计/频道）**需要** Key。

### 何时需要

| 能力 | 需要 API Key |
|------|-------------|
| TubePilot `search_videos` / `get_trending` / `get_video_details` / `get_channel_videos` | **是（P2 可选）** |
| TubePilot `get_video_info` / `get_transcript` / `get_video_frames` / `deep_analyze_video` | **否** |
| `youtube-transcript-api`（`npm run youtube:extract`） | 否 |
| `seeds.json` + yt-dlp 发现（默认） | 否 |
| YouTube sau 发布 | 否（用 cookie 登录态） |

### 缺 Key 时 Agent / 用户怎么做

1. **不要**对用户说「TubePilot 用不了」——应说「不能自动搜列表；已知链接仍可分析」。
2. 要搜爆款：优先 `npm run youtube:explore-full -- --topic {slug} --keyword "..." --top 5`（yt-dlp fallback）。
3. yt-dlp 也被风控：用户贴链接 → 写入 `raw.json` → 继续 score / extract。
4. 长期仍建议申请 Key，主路径更稳。

### 申请步骤

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目 → **API 和服务** → **库** → 启用 **YouTube Data API v3**
3. **凭据** → **创建凭据** → **API 密钥**
4. （建议）限制密钥仅用于 YouTube Data API v3

### 写入 Hermes `.env`

```bash
# 复制 .env.EXAMPLE 为 .env 后填写
YOUTUBE_API_KEY=你的密钥
```

勿提交 Git。其他用户须自行申请并填入本地 `.env`。

---

## 2. 免 Key 发现（seeds + InnerTube，默认路径）

发现阶段**默认不需要任何 API Key**。三条路（详见 `skills/explore/youtube/yt-viral-discover` 的「分场景决策表」）：

### 2.1 运营圈定种子（P0，推荐 MVP）

新建 `config/seeds.json`（示例见 `config/seeds.example.json`）：

```json
[
  { "type": "channel", "id": "UCxxxx", "category": "AI工具" },
  { "type": "video", "url": "https://youtu.be/xxxx", "category": "爆款样本" }
]
```

运行（yt-dlp 取播放/点赞硬指标，全程免 Key）：

```powershell
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic tiktok-shop --top 5
```

- `type: "channel"`：用 yt-dlp 拉频道视频列表，再逐条取硬指标
- `type: "video"`：直接用 yt-dlp 取该视频硬指标
- 输出 `知识库/youtube/{slug}/raw.json`，交给 `youtube:score` 分级
- 种子的 `category` 字段会透传到 `raw.json`，便于后续按品类筛选

### 2.2 yt-dlp 关键词搜索（P0 兜底）

```powershell
npm run youtube:explore-full -- --topic {slug} --keyword "TikTok Shop seller guide 2026" --top 5
```

### 2.3 InnerTube trending / browse（P1，免 Key，已实现）

**自动热门发现**：直接打 YouTube 内部接口 `youtubei/v1/browse`（`browseId=FEtrending`，可加区域 `gl` 与分类 `FEtrending_music/gaming/movies`），使用 YouTube 前端**公开 client key**（非个人 API Key），**零个人 Key**。代码见 `skills/explore/youtube/scripts/lib/discover-innertube.mjs`。

```powershell
# 自动拿美国全区热门榜（免 Key），可换 --region GB / --category music
npm run youtube:explore-trending -- --topic tiktok-shop --region US --category all --top 5
```

实现要点：
- **直连 InnerTube browse**：解析响应里的 `videoRenderer`，拿到热门视频 ID / 标题 / 频道 / 时长 / 播放量。
- **硬指标二次补齐**：列表项再用 `yt-dlp`（`fetchVideoDetails`）取精确 `view_count / like_count`，对齐种子路径的字段结构。
- **自动回退**：InnerTube 直连被限流/接口变动 → 自动回退 `yt-dlp` trending feed（本质也是 InnerTube `FEtrending`），保证零 Key 也能跑通。
- 批量注意频率控制（≤ 5 req/10s/IP）。

> 区别：InnerTube 是「YouTube 网站/App 自己用的内部接口，公开 client key」；yt-dlp 是其封装。两者都**不需要个人 API Key**。不做关键词级搜索排名（那必须 YouTube Data API，留到 § 4 P2）。

---

## 3. TubePilot MCP 配置

> ⚠️ **务必使用 MCP 版 `npx -y tubepilot`（ixex）**，不要用 **42.uk 网页版 TubePilot**（无 Key 时数据为 AI 估算，不准，且强制要 Key）。两者同名，勿混淆。

[TubePilot](https://github.com/ixex/tubepilot)（MIT）通过 MCP 提供 YouTube 搜索、热点、详情、字幕等工具。本仓库只需其**免 Key 的 27 个基础工具**（已知链接的简介/字幕/抽帧/摘要/综合剖析）；搜索/热点/官方统计/频道等 22 个扩展工具才需 Key（P2 可选）。

### MCP 客户端配置

> 配置写入 MCP 客户端（如 WorkBuddy `~/.workbuddy/mcp.json` 或 Cursor 的 `mcp.json`），**不要填 `YOUTUBE_API_KEY`**，保持免 Key：

```json
{
  "mcpServers": {
    "tubepilot": {
      "command": "npx",
      "args": ["-y", "tubepilot"]
    }
  }
}
```

**P2（可选）有 Key 时**，再在 `env` 里加上 `YOUTUBE_API_KEY`（与 `.env` 相同，免费不绑卡），以启用搜索/统计等扩展工具：

```json
{
  "mcpServers": {
    "tubepilot": {
      "command": "npx",
      "args": ["-y", "tubepilot"],
      "env": {
        "YOUTUBE_API_KEY": "你的密钥（与 .env 相同）"
      }
    }
  }
}
```

### 验证

```powershell
npx -y tubepilot
```

首次运行自动从 npm 拉包，**无需 clone 源码**。

### explore 常用工具

| 工具 | 用途 | 要 Key |
|------|------|--------|
| `search_videos` | 关键词搜索 | 是（P2） |
| `get_trending` | 区域热点 | 是（P2） |
| `get_video_details` | 播放/点赞/评论/时长 | 是（P2） |
| `compare_videos` | 多条对比 | 是（P2） |
| `get_channel_videos` | 竞品频道列表 | 是（P2） |
| `get_video_info` | 标题/简介/时长 | 否 |
| `get_transcript` | 字幕 | 否 |
| `list_caption_languages` | 探字幕语言 | 否 |
| `get_video_frames` / `get_frame_at_time` | 关键帧 / 指定时刻截图 | 否 |
| `get_video_moment` / `video_timeline` | 帧+字幕联合 / 时间线总览 | 否 |
| `get_video_summary` / `get_video_outline` / `convert_to_notes` | 概要/大纲/笔记 | 否 |
| `deep_analyze_video` | 综合剖析（info+字幕+章节+帧） | 否 |
| `analyze_short` | Shorts 专项 | 否 |

**免 Key 发现（默认，无需 MCP）**——优先级高于上方搜索类工具：

```powershell
# 运营圈定种子（推荐）
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic {slug} --top 5
# 或 yt-dlp 关键词兜底
npm run youtube:explore-full -- --topic {slug} --keyword "..." --top 5
```

Agent 将结果保存为 `$HERMES_ROOT/知识库/youtube/{topic_slug}/raw.json`，再执行：

```powershell
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug}
npm run youtube:explore -- --topic {slug}
```

---

## 4. youtube-transcript-api（字幕抽取）

[youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api)（MIT），pip 安装即可，源码不进本仓库。

### 安装

```powershell
uv pip install youtube-transcript-api
```

或运行时由 CLI 自动 `--with`（需已安装 `uv`）。

### 使用

```powershell
npm run youtube:extract -- --video-id <videoId>
npm run youtube:extract -- --from "$HERMES_ROOT/探索/YouTube/ranked_xxx.json"
```

### 离线备份（可选）

可将 wheel 备份到 `D:\test\agent\hermes\依赖\python\wheels\`，见上级 `依赖/README.md`。

---

## 5. 端到端流程速查（免 API 优先）

```text
① 免 Key 发现（三选一）：
   - 运营种子：npm run youtube:explore-seeds -- --seeds config/seeds.json --topic {slug}
   - 关键词兜底：npm run youtube:explore-full -- --topic {slug} --keyword "..."
   - （P2 可选）TubePilot 搜索/详情 → 存 raw.json
   → 产出 知识库/youtube/{slug}/raw.json（yt-dlp 已补齐播放/点赞硬指标）
② npm run youtube:score -- --in raw.json --topic {slug} --top 5        # 本地 ER 分级（免 Key）
③ npm run youtube:explore -- --topic {slug}                          # 抽字幕 + HTML + 金句库（免 Key）
④ Agent 执行 yt-script-analyze（TubePilot 免费工具 / crv 画面拆解）→ 补充 scripts_raw + #1 深拆（免 Key）
⑤ 写稿 / create-video → publish（sau，cookie 登录态，免 Key）
```

## 6. 产出契约（v2）

每次爬取一个话题，固定 **3 件交付物**：

| 文件 | 路径 |
|------|------|
| HTML 报告 | `$HERMES_ROOT/知识库/youtube/{slug}/{slug}_爆款报告.html` |
| 原始脚本 | `$HERMES_ROOT/知识库/youtube/{slug}/scripts_raw.json` |
| 金句库 | `$HERMES_ROOT/知识库/youtube/金句库.csv`（全库追加去重） |

**Agent 对话**：只交付 HTML 路径 + 简短结论 + 知识库路径清单；不贴 JSON/长脚本。

技能路径：`skills/explore/youtube/yt-viral-research/SKILL.md`

---

## 相关

- 选题多样化：[`topic-research-diversity.md`](topic-research-diversity.md)
- 依赖策略：[`dependency-policy.md`](dependency-policy.md)
- YouTube 发布：[`skills/publish/youtube/references/sau-runbook.md`](../../skills/publish/youtube/references/sau-runbook.md)
