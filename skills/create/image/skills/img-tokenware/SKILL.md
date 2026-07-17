---
name: img-tokenware
description: |
  Tokenware AI 生图（create/focused-task）。封面、卡片、内插图；非小红书主路径。
  触发：「生图」「配图」「封面图」「出一张图」；小红书 pipeline 失败降级时。
  口语：AI 配图、生成封面、tokenware 生图、公众号封面。
version: 1.0.0
author: vidau
license: MIT
metadata:
  vidau:
    tags: [image, tokenware, cover, illustration, social-media]
    related_skills:
      - xhs-card-render
      - pipeline-orchestrator
---

# img-tokenware（Tokenware 生图）

流水线 **Step 4c 配图** 技能。知乎/公众号/抖音/YouTube 封面，以及**小红书 pipeline 失败后的降级**。

## When to use

- 非小红书平台需要 AI 封面/配图
- 小红书 **`pipeline:xhs` 已失败** 且用户确认 AI 降级风险
- 典型说法：「生一张封面」「AI 配图」「公众号封面图」

## When not to use

- 小红书**首选**模板卡片 → **`xhs-card-render`** / `pipeline:xhs`（勿起手 tokenware）
- 发布到任何平台 → 对应 **`{code}-publish`**
- BMP/ffmpeg/execute_code 自造图 → **禁止**

## 小红书降级（仅 pipeline:xhs 失败后）

当 `npm run pipeline:xhs` 已失败时，可作为配图降级方案：

- **交互任务**：须向用户说明「可能被平台标记为 AI 内容」的风险，用户确认后才执行
- **定时任务**：自动执行，无需用户确认（日志记录风险）
- **禁止**与 pipeline:xhs 并行二选一；**禁止**起手就用本技能替代模版卡片

## 前置条件

- 项目 `.env` 已配置 `OPENAI_API_KEY`（tokenware API Key）
- 查看路径：`项目 .env 路径`

验证：

```powershell
npm run image:check-key
```

## 平台尺寸

| 平台 | `--platform` | 尺寸 | 用途 |
|------|--------------|------|------|
| 知乎 | `zhihu` | 1792×1024 | 专栏封面 |
| 公众号 | `wechat` | 1792×1024 | 题图/封面 |
| 小红书 | `xiaohongshu` | 1024×1792 | 卡片图 1–3 张 |
| 抖音 | `douyin` | 1792×1024 | 视频封面/背景 |
| YouTube | `youtube` | 1792×1024 | 视频封面 |
| 正方形 | `square` | 1024×1024 | 通用 |

## CLI（推荐）

仓库根目录执行：

```powershell
# 知乎封面
npm run image:generate -- `
  --platform zhihu `
  --prompt "TK小店选品趋势信息图，现代扁平风，中文标题" `
  --out "$CONTENT_ROOT/图片/知乎/20260630_cover.png"

# 小红书卡片
npm run image:generate -- `
  --platform xiaohongshu `
  --prompt "竖版知识卡片，3条选品技巧，简洁配色" `
  --out "$CONTENT_ROOT/图片/小红书/card1.jpg"
```

默认模型：`gpt-image-2`。未指定 `--out` 时保存到 `CONTENT_ROOT/图片/{平台}/`（默认 `$CONTENT_ROOT`）。

## Agent 执行规则

1. **只走 tokenware**：调用本技能 CLI 或 `references/api.md` 中的 API。
2. **提示词**：写清主题、风格、是否含文字；中英混合描述效果更好。
3. **保存**：URL 有时效，生成后立即下载到 `$CONTENT_ROOT/图片/{平台}/`。
4. **失败一次即汇报**（非小红书主路径）：不要反复换工具。小红书主路径见 xhs-cron-runbook。

## 配图失败处理

```
配图失败，原因：[API 返回信息]
可选：A) 检查 项目 .env 中 OPENAI_API_KEY 后重试
      B) 跳过配图，先发布文字版
```

## 参考

- `references/api.md` — API 字段、模型列表、Python 片段
- 主技能 `pipeline-orchestrator` Step 4c

## npm 快捷方式

```powershell
npm run image:check-key
npm run image:generate -- --platform zhihu --prompt "..." --out "..."
```
