# YouTube Explore 配置（爆款调研 · crv + whisper + CLI 报告）

> ①② seeds/trending + yt-dlp → ③a 字幕（官方→yt-dlp→whisper）→ ③b **crv 画面** → ④ **仅 CLI 出 HTML**。  
> **publish** 仍走 sau：[`skills/publish/youtube/references/sau-runbook.md`](../../skills/publish/youtube/references/sau-runbook.md)。

---

## 0. 架构结论（先读）

| 阶段 | 主工具 | API Key |
|------|--------|:-------:|
| ①② 发现/筛爆款 | seeds / `--trending` + yt-dlp 硬指标 | 否 |
| ③a 字幕/脚本 | youtube-transcript-api → yt-dlp → **faster-whisper** | 否 |
| ③b 画面 | **crv（claude-real-video）** 逐帧 | 否 |
| ④ 报告 | **`npm run youtube:research`**（`report-boss-html.mjs`） | 否 |
| P2 关键词搜/评论/频道 | TubePilot 扩展 + `YOUTUBE_API_KEY` | 是（可选） |

**完整免 API 链路**：

```text
InnerTube trending / seeds / yt-dlp
  → score + yt-dlp 硬指标
  → extract（captions | whisper）→ timed + sentences
  → crv 逐帧 → 写 deep_dive.visual_*
  → youtube:research → HTML + 金句库
```

### 报告硬约束（Agent 必遵）

- **唯一合法 HTML**：`npm run youtube:research`（或 `youtube:explore*` 管线内同逻辑）
- **禁止** `Write` / 手写 / 自创版式覆盖 `{slug}_爆款报告.html`
- **Agent 只改** `scripts_raw.json`；HTML 只许 CLI
- **交付前自检**：报告含 `chart.js` CDN **且**含「爆款方法论」；否则重跑 CLI

---

## 1. 免 Key 发现（seeds + InnerTube）

### 1.1 运营种子（P0）

`config/seeds.example.json` → 复制为 `config/seeds.json` 或话题目录 `seeds.json`：

```powershell
npm run youtube:explore-seeds -- --seeds config/seeds.example.json --topic tiktok-shop --top 5
```

### 1.2 yt-dlp 关键词（P0 兜底）

```powershell
npm run youtube:explore-full -- --topic {slug} --keyword "..." --top 5
```

### 1.3 InnerTube trending（P1）

```powershell
npm run youtube:explore-trending -- --topic {slug} --region US --category all --top 5
```

代码：`skills/explore/youtube/scripts/lib/discover-innertube.mjs`（公开 client key，非个人 API Key）。

---

## 2. 字幕与 whisper（③a）

失败链：`youtube-transcript-api` → yt-dlp 字幕 → **faster-whisper / whisper CLI** → `unavailable`。

```powershell
uv pip install youtube-transcript-api
uv pip install faster-whisper
# 或本机 openai-whisper：whisper --help

npm run youtube:extract -- --from ".../ranked.json" --merge-raw --slug {slug} --lang zh,zh-Hans,en
```

| 环境变量 | 含义 |
|----------|------|
| `WHISPER_TMP` | 可选。覆盖字幕工作根目录；默认 `$CONTENT_ROOT/知识库/youtube/_whisper` |
| `WHISPER_MODEL` | whisper CLI 模型，默认 `base` |
| `TEMP` / `TMP` | crv 拼图等临时文件建议 `%LOCALAPPDATA%\Temp`（勿与字幕知识库目录混用） |

字幕落盘（知识库）：

```text
$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}/
├── audio.m4a              # yt-dlp 音频
├── transcript.json        # whisper 成功时的时间轴台词缓存
└── ...
$CONTENT_ROOT/知识库/youtube/{slug}/scripts_raw.json   # 合并后的正式脚本（timed + sentences）
```

实现：`skills/explore/youtube/scripts/lib/extract-whisper.mjs`（由 `cli.mjs extract` 自动调用）。

**硬规则**：成功必须非空 `timed`/`sentences`；禁止用简介冒充时间轴台词。

---

## 3. crv 画面（③b）

| 项 | 约定 |
|----|------|
| 工具 | claude-real-video（`crv`） |
| Python | 环境变量 `CRV_PYTHON`；默认示例 `C:\Users\EDY\.workbuddy\binaries\python\envs\claude-video\Scripts\python.exe` |
| 输出目录 | **必须 Temp**：`%LOCALAPPDATA%\Temp\crv-{videoId}`（勿写 D: 工作区，防 safe-delete） |
| 范围 | Top1 **必做**；建议 Top3 |
| 写回 | `deep_dive.visual_style_note` / `visual_timeline_note` / `viral_points` |

下载示例：

```powershell
$vid = "<videoId>"
$dir = "content\知识库\youtube\_downloads\$vid"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
uv run yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "$dir\%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$vid"
$out = Join-Path $env:LOCALAPPDATA "Temp\crv-$vid"
New-Item -ItemType Directory -Force -Path $out | Out-Null
& $env:CRV_PYTHON -m crv "$dir\$vid.mp4" --output "$out"
```

具体 `crv` 子命令以本机 `crv --help` 为准。详见 `yt-script-analyze` skill。

TubePilot 画面工具为**可选增强**；400 忽略，**不得**替代 crv 主路径或中断管线。

---

## 4. YOUTUBE_API_KEY（仅 P2）

仅关键词搜 / 评论区 / 频道监控需要。MCP 版 TubePilot（`npx -y tubepilot`）免费工具可不配 Key；**不要用 42.uk 网页版**。

缺 Key：**不要说 TubePilot 完全不能用**；走 seeds/trending + whisper + crv + CLI 报告即可。

写入 project `.env`（勿提交 Git）：

```bash
YOUTUBE_API_KEY=你的密钥
```

---

## 5. TubePilot MCP（可选 / P2）

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

P2 再在 `env` 加 `YOUTUBE_API_KEY`。400 / unavailable → **跳过继续** whisper/crv。

---

## 6. 端到端流程

```text
① explore-seeds / explore-trending / explore-full → raw.json
② youtube:score → ranked.json
③ youtube:extract（含 whisper）→ scripts_raw timed/sentences
④ Agent：crv Top1～3 → 写 deep_dive → 写回 scripts_raw
⑤ npm run youtube:research → HTML + 金句库   ← 禁止手写 HTML
⑥ 对话：open_resource HTML + 1～2 句 + 路径清单
```

## 7. 产出契约

| 文件 | 路径 |
|------|------|
| HTML（仅 CLI） | `$CONTENT_ROOT/知识库/youtube/{slug}/{slug}_爆款报告.html` |
| 原始脚本 | `.../scripts_raw.json`（须含时间+台词） |
| 字幕/转写缓存 | `$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}/` |
| 本地下载（crv） | `$CONTENT_ROOT/知识库/youtube/_downloads/{videoId}/` |
| 金句库 | `$CONTENT_ROOT/知识库/youtube/金句库.csv` |

技能入口：`skills/explore/youtube/yt-viral-research/SKILL.md`

---

## 相关

- 选题：[`topic-research-diversity.md`](topic-research-diversity.md)
- 依赖：[`dependency-policy.md`](dependency-policy.md)
- 发布：[`skills/publish/youtube/references/sau-runbook.md`](../../skills/publish/youtube/references/sau-runbook.md)
