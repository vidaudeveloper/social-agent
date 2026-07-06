---
name: pipeline-orchestrator
description: "社媒内容管线编排器 — 用户说'跑一篇内容''今日选题''发一篇文章'时激活。加载此技能后按 Step 1→5 顺序执行完整管线。"
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [pipeline, content-pipeline, social-media, orchestrator]
    related_skills:
      - social-media/xiaohongshu
      - social-media/youtube
      - social-media/douyin
      - social-media/zhihu
      - social-media/tiktok
      - social-media/image
      - humanizer
      - baoyu-infographic
---

# 社媒内容管线编排器

**触发条件**：用户说「跑一篇内容」「今日选题」「发一篇文章」「帮我分发」「全自动流水线」
**不要用于**：只写一篇稿不发布 / 只查热点不创作 / 纯翻译纯美工

## Step 0: 初始化用户画像

读取 `workspace/user-profile.md`。不存在则一次性收集：

- 行业 / 平台开关 / API Key 是否已配置
- **内容语言偏好**：`zh-CN` | `en-US` | `bilingual`
- **发布语言策略**：全平台统一 | 按平台默认（国内中文、海外英文）

写入 `user-profile.md` 后再进入 Step 1。

## Step 1: 选题采集

搜索用户行业+兴趣领域的最近 24-48h 热点：
- web_search 行业关键词+热点/趋势/爆款
- 小红书搜索（如已配 XHS Bridge）
- 知乎热榜（如已登录）
- blogwatcher RSS（如已配）

输出 5-8 候选选题（含热点来源+事实摘要+为什么值得写）。

## Step 2: 适配矩阵（唯一人工确认点）

按用户画像预判适配矩阵，输出后**等待用户确认**。

| 平台 | 适合 | 不适合 |
|------|------|--------|
| 知乎 | 深度分析、技术解读、行业趋势 | 纯生活化、种草 |
| 公众号 | 热点解读、实操干货、行业洞察 | 纯学术、过于技术化 |
| 小红书 | 产品种草、生活攻略、工具推荐 | 纯政策分析、硬核技术 |
| 抖音 | 热点口播、短教程、种草测评 | 深度长文、纯文字 |

用户确认后进入 Step 3。

## Step 3: 母稿生产

按 **Step 0 语言偏好** 决定母稿与改写语言：

| 内容语言偏好 | 规则 |
|--------------|------|
| `zh-CN` | 知乎/公众号/小红书/抖音用中文母稿与改写 |
| `en-US` | YouTube/TikTok/Reddit/LinkedIn/X 用英文母稿与改写 |
| `bilingual` | 先中文深度母稿，再并行英文改写海外平台 |

若 `发布语言策略` 为「按平台默认」，在 `zh-CN`/`bilingual` 下仍对海外平台出英文版。

- **≥3 平台**：先写深度母稿 → delegate_task 并行改写各平台版本
- **1-2 平台**：直接按目标平台风格写

各平台改写要点：
- **知乎**：加粗做章节标题，不用 `#` `##` `###`，不用 `|` 表格
- **公众号**：标题钩子，场景切入，数据故事化，金句收尾，~2500 字
- **小红书**：标题反问/感叹，对话口吻，每节 260-320 字
- **抖音**：3 秒钩子，口语化短句，600-900 字
- **YouTube**：英文版深度内容 + TTS
- **TikTok**：英文口播 ≤90 秒

写入 `$HERMES_ROOT/文章/{平台}/{日期}_{slug}.md`

## Step 4: 润色 + 排版 + 配图

1. **humanizer** 去AI味（检查核心论点不丢失）
2. **排版**：公众号 → baoyu-markdown-to-html；小红书 → 配图 MD 格式
3. **配图**：小红书先 `pipeline:xhs` 模板卡片 → 失败再 tokenware（交互需确认）
   其他平台 → tokenware-image 封面 1792×1024

## Step 5: 发布

按 user-profile 平台开关逐一发布：

| 平台 | 命令 |
|------|------|
| 公众号 | baoyu-post-to-wechat API → 草稿箱 |
| 小红书 | python cli.py publish (XHS Bridge) |
| 知乎 | npm run zhihu:publish |
| 抖音 | npx @panda-video-automation/pva |
| YouTube | node skills/youtube/scripts/cli.mjs publish |
| TikTok | uv run python skills/tiktok/scripts/cli.py publish |
| LinkedIn | `npm run linkedin:publish`（须先 `linkedin:setup` + `linkedin:login`；默认只出稿） |

**规则**：
- 发布失败不阻塞全流程，标记原因继续其他平台
- 间隔 5-10 分钟避免风控
- LinkedIn/X 默认只出稿不自动发
- 输出发布报告

## 常见陷阱

1. 用户画像未初始化不要假设已配好，每次先检查
2. 小红书配图顺序：`pipeline:xhs` → 失败 → tokenware（交互需确认AI风险）
3. 知乎文章不是 markdown：不用 `#` `##` 标题、`|` 表格、`>` 引用块
4. 多平台改写用 `delegate_task` 并行跑
5. 润色后检查核心论点是否丢失
6. 一个平台失败标记原因继续其他平台
