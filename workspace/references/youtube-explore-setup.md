# YouTube Explore 配置（爆款调研 + 字幕抽取）

> explore 层 YouTube 能力：TubePilot MCP 找爆款 → 本地 CLI 分级 → youtube-transcript-api 抽字幕 → 知识库沉淀。  
> **publish** 上传仍走 sau，见 [`skills/publish/youtube/references/sau-runbook.md`](../../skills/publish/youtube/references/sau-runbook.md)。

---

## 1. YOUTUBE_API_KEY（TubePilot 搜索/热点/详情）

### 何时需要

| 能力 | 需要 API Key |
|------|-------------|
| TubePilot `search_videos` / `get_trending` / `get_video_details` | **是** |
| TubePilot `get_transcript` | 否 |
| `youtube-transcript-api`（`npm run youtube:extract`） | 否 |
| YouTube sau 发布 | 否（用 cookie 登录态） |

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

## 2. TubePilot MCP 配置

[TubePilot](https://github.com/ixex/tubepilot)（MIT）通过 MCP 提供 YouTube 搜索、热点、详情、字幕等工具。

### Cursor / MCP 客户端配置

在 MCP 配置（如 Cursor `mcp.json`）中添加：

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

| 工具 | 用途 |
|------|------|
| `search_videos` | 关键词搜索 |
| `get_trending` | 区域热点 |
| `get_video_details` | 播放/点赞/评论/时长 |
| `compare_videos` | 多条对比 |
| `get_channel_videos` | 竞品频道列表 |
| `get_transcript` | 字幕（无 API Key，作 extract 备用） |

Agent 将 MCP 结果保存为 `$HERMES_ROOT/知识库/youtube/{topic_slug}/raw.json`，再执行：

```powershell
npm run youtube:score -- --in "$HERMES_ROOT/知识库/youtube/{slug}/raw.json" --topic {slug}
npm run youtube:explore -- --topic {slug}
```

yt-dlp 补位（无 MCP / 无 API Key 时）：

```powershell
npm run youtube:explore-full -- --topic {slug} --keyword "..." --top 5
```

---

## 3. youtube-transcript-api（字幕抽取）

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

## 4. 端到端流程速查

```text
① Agent 调 TubePilot MCP → 存 知识库/youtube/{slug}/raw.json
② npm run youtube:score -- --in raw.json --topic {slug} --top 5
③ npm run youtube:explore -- --topic {slug}
④ Agent 执行 yt-script-analyze → 补充 scripts_raw + #1 深拆
⑤ 写稿 / create-video → publish（sau）
```

## 5. 产出契约（v2）

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
