---
name: xhs-card-render
description: |
  小红书模板配图（create/focused-task）。配图 MD → pipeline:xhs → PNG 卡片，非 AI 生图。
  触发：「小红书配图」「卡片图」「pipeline:xhs」「笔记配图」。
  口语：小红书卡片、模板出图、笔记配图、小红书图文卡片。
version: 1.0.0
metadata:
  hermes:
    tags: [xiaohongshu, card, markdown, pipeline]
    related_skills:
      - img-tokenware
      - xhs-publish
      - create/pipeline-orchestrator
---

# 小红书卡片配图（xhs-card-render）

**模板卡片出图，不是 AI 生图。** Agent 只需执行 `npm run pipeline:xhs`，勿单独操作浏览器截图或 HTML 渲染。

## When to use

- 小红书笔记需要**模板卡片**配图（Step 4c 或用户单独要配图）
- 已有配图 Markdown + frontmatter，要出 1080×1440 PNG
- 典型说法：「小红书配图」「跑 pipeline:xhs」「卡片出图」

## When not to use

- 知乎/公众号/YouTube 封面等 → **`img-tokenware`**
- `pipeline:xhs` **失败后**的 AI 降级 → **`img-tokenware`**（须用户确认风险）
- 直接发布笔记 → **`xhs-publish`**
- execute_code / ffmpeg / BMP 自造图 → **禁止**

## 默认配置（已验证）

| 项 | 值 |
|----|-----|
| 主题 | `professional`（商务蓝，专业干练）；见下方 **8 内置主题** |
| 分页 | `auto-split`（短章节合并 + **按内容双向缩放**填满卡片） |
| 尺寸 | 1080×1440（3:4） |
| 工具路径 | `tool/Auto-Redbook-Skills`（可通过环境变量覆盖） |

## Markdown 格式

```markdown
---
emoji: "📊"
title: "主标题（封面用，≤20字）"
subtitle: "副标题"
author: "昵称"
date: "2026-06-29"
---

# 章节标题

导语 1-2 句，交代背景或结论……

- 要点一（15-30 字，可含 **加粗关键词**）
- 要点二
- 要点三
- 要点四

---

# 下一章节

……
```

## 撰稿规格（饱满度）

流水线 **Step 3/4b 写小红书配图 MD 时必须遵守**，避免一页只有标题+三条短 bullet 显得空。

| 项 | 建议 |
|----|------|
| **全篇正文卡** | 目标 **3-4 张**（含封面共 4-5 张图） |
| **每个 `---` 章节** | **260-320 字**（含标题不计入），目标占卡片高度 **~92%** |
| **章节结构** | `# 标题` + **导语 2-3 句** + **5-6 条**要点列表 |
| **每条要点** | **20-35 字**，写清动作/数字/原因，不要只写短语 |
| **渲染缩放** | 内容偏空自动放大（最高 **1.35×**），偏多略缩小（最低 **0.88×**） |
| **分隔符 `---`** | 逻辑分节用；渲染时会**自动合并短节**填满单卡，不必刻意少写 |

**要点**：`---` 是写作时的逻辑章节，不是「一节必一页」。短章节会合并到同一张卡片；单节超过一卡高度时才会拆页，且**标题不会单独留在上一张末尾**。

## 内置主题（共 8 个）

| 参数值 | 名称 | 风格 | 跨境干货号 |
|--------|------|------|------------|
| `professional` | 专业商务 | 蓝框白底，简洁稳重 | **推荐** |
| `default` | 默认简约 | 浅灰底 + 靛紫标题 | 可用 |
| `sketch` | 手绘素描 | 米纸网格 + 铅笔风 | 偏生活向 |
| `terminal` | 终端命令行 | 深色背景 + 高饱和绿/蓝 | 已 patch 加粗可读 |
| `retro` | 复古怀旧 | 暖橙边框 | 偏生活方式 |
| `botanical` | 植物园自然 | 绿色自然风 | 美妆/生活 |
| `playful-geometric` | 活泼几何 | Memphis 紫粉渐变 | 已 patch 防拆页 |
| `neo-brutalism` | 新粗野主义 | 粗框强对比红黄 | 已 patch 防拆页 |

预览样例：`$HERMES_ROOT/图片/小红书/preview-20260629/themes-preview/{主题名}/`

## 自定义主题

**可以。** 主题 = CSS 文件，控制卡片内层排版。在 `assets/xhs-themes/` 新建 `my-brand.css`，`npm run tool:install` 同步后 `-Theme my-brand` 即可。示例：`hermes-crossborder`（海军蓝 + 橙）。详见 `assets/xhs-themes/README.md`。

## 命令

仓库根目录：

```powershell
# 推荐：写稿后一键出图（自动解析 文章/小红书 → 图片/小红书）
npm run pipeline:xhs -- -Slug "preview-20260629-tk-gmvmax"

# 或指定 MD 路径
npm run pipeline:xhs -- -File "$HERMES_ROOT/文章/小红书/xxx.md" -Theme professional
```

输出：`cover.png` + `card_*.png` + `manifest.json`（供 Step 5 发布取图路径）。

底层命令（自定义 Out/Theme）：

```powershell
npm run xhs:card-render -- `
  -File "$HERMES_ROOT/文章/小红书/xxx.md" `
  -Out "$HERMES_ROOT/图片/小红书/xxx"
```

可选参数：`--theme professional`（默认）、`--mode auto-split`（默认）、`--mode separator`（严格按 `---` 一页一节）。

## 输出

- `cover.png` — 封面（emoji + 标题 + 副标题）
- `card_1.png` … `card_N.png` — 正文卡片

发布时把 `cover.png` 与全部 `card_*.png` 传给 `skills/publish/xiaohongshu` 的 `publish` / `fill-publish`。

## 依赖

```powershell
npm run tool:install   # 含 Auto-Redbook 与 Python 渲染环境，Agent 勿逐步安装 playwright
```

出图失败且提示缺少环境时，再执行一次 `npm run tool:install`。

## 与 img-tokenware 分工

| 场景 | 技能 |
|------|------|
| **小红书正文卡片** | **本技能**（xhs-card-render） |
| 知乎封面 | img-tokenware |
| 公众号封面 | img-tokenware |
| 抖音/YouTube 封面 | img-tokenware |

## 配图失败

**禁止**起手 img-tokenware 或并行「xhs-card-render 或 img-tokenware」。按 `skills/publish/xiaohongshu/references/xhs-cron-runbook.md`：

- **交互**：A) `tool:install` 后重试 pipeline:xhs；B) 用户确认后 img-tokenware（附 AI 标记风险）；C) 跳过配图；D) 放弃
- **Cron**：A) 重试 pipeline:xhs；B) 自动 img-tokenware；C) 跳过并记录

不要 BMP/ffmpeg/execute_code 自造图。
