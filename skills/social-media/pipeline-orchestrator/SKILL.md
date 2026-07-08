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
      - content-reviewer
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

搜索用户行业+兴趣领域的最近 24-48h 热点（**须多样化，避免每次同一批 TK/选品/封号话题**）：

- web_search：用**不同切入角**的关键词（案例/数据/政策/工具/长尾），禁止连续两次相同泛词
- 小红书 `search-feeds`（如已配 XHS Bridge）
- 知乎热榜（如已登录）
- blogwatcher RSS（如已配）
- 对照 `$HERMES_ROOT/文章/` 近 30 天标题，**去重**

详细规则见 `workspace/references/topic-research-diversity.md`。

输出 5-8 候选选题（含**来源 URL** + 事实摘要 + 为什么值得写 + 与历史稿件差异）。

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

## Step 4.5: 发布前审核

对每个待发布平台调用 **`content-reviewer`**（规则见 `skills/content-reviewer/rules/`）：

1. 传入 `platform` + 文稿绝对路径（+ 配图路径 / Reddit `--subreddit`）
2. 运行 `npm run review:lint -- --platform ... --file ...`
3. 对 rubric 类检查按 SKILL 完成软审核并写入 `$HERMES_ROOT/审核/{日期}_{slug}.md`
4. **存在 error → 暂停 Step 5**，返回修复清单；仅 warn → 报告后询问是否继续

本步骤可单独使用，不依赖 Step 4 是否执行 humanizer。

## Step 4.9: 发布前确认（须绝对路径）

进入 Step 5 前，**必须**向用户展示确认表：

1. 打印 `HERMES_ROOT` **解析后的绝对路径**（Windows / macOS 均用本机真实路径）
2. 每个待发布平台：标题 + 发布用文件绝对路径（小红书 manifest + 全图列表；知乎 **.html**）
3. 禁止只写摘要（「N 张卡片」「HTML 格式」）

格式与 Win/Mac 示例见 `workspace/references/publish-confirm-paths.md`。  
**等待用户明确确认后**再执行 Step 5。

## Step 5: 发布

按 user-profile 平台开关逐一发布。发布前对照 `workspace/references/platform-login-quickstart.md` 检查各平台登录态。

**已测试通过**（可自动发布）：知乎、小红书、Reddit、YouTube、TikTok、**X（baoyu，默认填稿/可 --submit）**。  
**未测试通过**（默认只归档文稿到 `$HERMES_ROOT/文章/{平台}/`，不执行 publish CLI，除非用户明确要求）：
抖音、公众号、LinkedIn。

| 平台 | 命令 | 验证状态 |
|------|------|----------|
| 知乎 | npm run zhihu:publish | ✅ |
| 小红书 | python cli.py publish (XHS Bridge) | ✅ |
| YouTube | node skills/youtube/scripts/cli.mjs publish | ✅ |
| TikTok | uv run python skills/tiktok/scripts/cli.py publish | ✅ |
| Reddit | `npm run reddit:publish` | ✅ |
| 公众号 | baoyu-post-to-wechat API → 草稿箱 | ⏳ 未测试 |
| 抖音 | npx @panda-video-automation/pva | ⏳ 未测试 |
| LinkedIn | `npm run linkedin:publish` | ⏳ 未测试 |
| X | `node skills/x/scripts/cli.mjs publish` | ✅ |

**规则**：
- 发布失败不阻塞全流程，标记原因继续其他平台
- 间隔 5-10 分钟避免风控
- 未测试平台默认只出稿；用户明确要求发布时须二次确认
- 输出发布报告

## 常见陷阱

1. 用户画像未初始化不要假设已配好，每次先检查
2. 小红书配图顺序：`pipeline:xhs` → 失败 → tokenware（交互需确认AI风险）；配图前先 `npm run tool:install`
3. 发布前确认必须含**绝对路径**（见 `publish-confirm-paths.md`）
4. 小红书发布后默认跳创作中心首页验收；未匹配须询问用户是否成功/是否重发
5. 知乎文章不是 markdown：不用 `#` `##` 标题、`|` 表格、`>` 引用块
6. 多平台改写用 `delegate_task` 并行跑
7. 润色后检查核心论点是否丢失
8. 一个平台失败标记原因继续其他平台
9. 选题去重与多信源见 `topic-research-diversity.md`
