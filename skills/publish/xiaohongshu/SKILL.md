---
name: xhs-skills
description: |
  小红书自动化总览（不进 Hub）。索引认证、发布、搜索、互动、复合运营子技能。
  触发：仅作索引参考；实际操作请直接用对应子技能（`xhs-publish`/`xhs-auth`/`xhs-explore`/`xhs-interact`/`xhs-research`/`xhs-post-analytics`）。
  口语：小红书自动化体系、小红书能力总览。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [xiaohongshu, publish, overview]
    related_skills:
      - xhs-auth
      - xhs-publish
      - xhs-explore
      - xhs-interact
    requires:
      bins:
        - python3
        - uv
    emoji: "\U0001F4D5"
    homepage: https://github.com/vidaudeveloper/social-agent/tree/master/skills/publish/xiaohongshu
    source: https://github.com/xpzouying/skills/xiaohongshu
    os:
      - darwin
      - linux
      - windows
---

# 小红书自动化 Skills

你是"小红书自动化助手"。根据用户意图路由到对应的子技能完成任务。

## When to use

- 需要小红书全部子技能总览、快速开始命令

## When not to use

- 已明确子任务（登录/发布/搜索/互动/调研/复盘）→ 直接用对应子技能（本总览不进 Hub）

## 🔒 技能边界（强制）

**发布 / 登录 / 搜索 / 互动**：通过 `skills/publish/xiaohongshu/scripts/cli.py` 子命令完成。

**发前调研 / 发后复盘**（profile 根目录 npm，非 cli.py 子命令）：

| 场景 | 命令 | 技能 |
|------|------|------|
| 发前竞品落盘 | `npm run xhs:research` | `explore/xiaohongshu/xhs-research` |
| 发后作品复盘 | `npm run xhs:stats -- archive …` | `analytics/xhs-post-analytics` |

复盘子命令 `export-note-data` **已在** `cli.py` 中实现（`archive` 无 `--in` 时会自动调用）。

- **禁止外部工具**：不得调用 MCP、Go 或其他非本仓库的小红书自动化方案。
- **发后复盘必须执行脚本**：收到发后数据/复盘请求，先在 profile 根目录运行
  `npm run xhs:stats -- archive --days 30 --account "账号昵称"`；不得自己打开浏览器定位「内容分析」或「导出数据」。
  无 `--in` 时，脚本会通过 Bridge 自动完成导航、点导出、等 xlsx、解析和生成报告。
- 若该命令失败，只报告 CLI 的结构化错误；除非用户明确要求排障，否则不要手工浏览器探查来替代脚本。
- **完成即止**：任务完成后直接告知结果，等待用户下一步指令。

---

## 输入判断

按优先级判断用户意图，路由到对应子技能：

1. **认证相关**（"登录 / 检查登录 / 切换账号"）→ `xhs-auth`（`publish/xiaohongshu/skills/xhs-auth`）。
2. **内容发布**（"发布 / 发帖 / 上传图文 / 上传视频"）→ `xhs-publish`（`publish/xiaohongshu/skills/xhs-publish`）。
3. **搜索发现**（"搜索笔记 / 查看详情 / 浏览首页 / 查看用户"）→ `xhs-explore`（`explore/xiaohongshu/xhs-explore`）。
4. **社交互动**（"评论 / 回复 / 点赞 / 收藏"）→ `xhs-interact`（`publish/xiaohongshu/skills/xhs-interact`）。
5. **复合运营**（"竞品分析 / 热点追踪 / 批量互动 / 一键创作"）→ `xhs-content-ops`（`explore/xiaohongshu/xhs-content-ops`）。
6. **发前调研落盘**（"竞品报告 / 热点报告 / 生成创作参考"）→ `xhs-research`（`explore/xiaohongshu/xhs-research`），`npm run xhs:research`。
7. **发后作品复盘**（"发布后数据分析 / 账号作品复盘 / 生成 HTML 报告"）→ `xhs-post-analytics`（`analytics/xhs-post-analytics`），`npm run xhs:stats`。

## 全局约束

- 所有操作前应确认登录状态（通过 `check-login`）。
- 发布和评论操作必须经过用户确认后才能执行。
- 文件路径必须使用绝对路径。
- CLI 输出为 JSON 格式，结构化呈现给用户。
- 操作频率不宜过高，保持合理间隔。

## 子技能概览

### xhs-auth — 认证管理

管理小红书登录状态和多账号切换。

| 命令 | 功能 |
|------|------|
| `cli.py check-login` | 检查登录状态，返回推荐登录方式 |
| `cli.py login` | 二维码登录（有界面环境） |
| `cli.py send-code --phone <号码>` | 手机登录第一步：发送验证码 |
| `cli.py verify-code --code <验证码>` | 手机登录第二步：提交验证码 |
| `cli.py delete-cookies` | 清除 cookies（退出/切换账号） |

### xhs-publish — 内容发布

发布图文或视频内容到小红书。

| 命令 | 功能 |
|------|------|
| `cli.py publish` | 图文发布（本地图片或 URL） |
| `cli.py publish-video` | 视频发布 |
| `publish_pipeline.py` | 发布流水线（含图片下载和登录检查） |

### xhs-explore — 内容发现

搜索笔记、查看详情、获取用户资料。

| 命令 | 功能 |
|------|------|
| `cli.py list-feeds` | 获取首页推荐 Feed |
| `cli.py search-feeds` | 关键词搜索笔记 |
| `cli.py get-feed-detail` | 获取笔记完整内容和评论 |
| `cli.py user-profile` | 获取用户主页信息 |

### xhs-interact — 社交互动

发表评论、回复、点赞、收藏。

| 命令 | 功能 |
|------|------|
| `cli.py post-comment` | 对笔记发表评论 |
| `cli.py reply-comment` | 回复指定评论 |
| `cli.py like-feed` | 点赞 / 取消点赞 |
| `cli.py favorite-feed` | 收藏 / 取消收藏 |

### xhs-content-ops — 复合运营

组合多步骤完成运营工作流：竞品分析、热点追踪、内容创作、互动管理。

### xhs-research — 发前调研落盘

竞品/热点分析完成后写入知识库 HTML + 创作参考（`npm run xhs:research`）。见 `explore/xiaohongshu/xhs-research`。

### xhs-post-analytics — 发后作品复盘

自己账号发布后数据分析（创作者中心导出 xlsx），生成 HTML + 下次创作参考。

**在 profile 根目录执行**（先 `cd` 到 social-agent 仓库根，再跑 npm）：

| 命令 | 功能 |
|------|------|
| `npm run xhs:stats -- archive --days 30 --account "<昵称>"` | 自动导出 + 解析 + HTML（需 Bridge） |
| `npm run xhs:stats -- archive --in "<xlsx路径>" --account "<昵称>"` | 用手导出的「笔记列表明细表」生成报告 |
| `npm run xhs:stats -- list` | 列出已有复盘 |
| `uv run python skills/publish/xiaohongshu/scripts/cli.py export-note-data --days 30` | 仅导出 xlsx |

脚本路径（均已实现，勿报「尚未实现」）：

- `skills/analytics/xhs-post-analytics/scripts/cli.mjs` — 入口
- `skills/analytics/xhs-post-analytics/scripts/archive.mjs` — archive 编排
- `skills/publish/xiaohongshu/scripts/xhs/note_data_export.py` — 点「导出数据」
- `skills/publish/xiaohongshu/scripts/cli.py` — 子命令 `export-note-data`

详见 `analytics/xhs-post-analytics/SKILL.md`。

## 快速开始

```bash
# 1. 启动 Chrome
python scripts/chrome_launcher.py

# 2. 检查登录状态
python scripts/cli.py check-login

# 3. 登录（如需要）
python scripts/cli.py login

# 4. 搜索笔记
python scripts/cli.py search-feeds --keyword "关键词"

# 5. 查看笔记详情
python scripts/cli.py get-feed-detail \
  --feed-id FEED_ID --xsec-token XSEC_TOKEN

# 6. 发布图文
python scripts/cli.py publish \
  --title-file title.txt \
  --content-file content.txt \
  --images "/abs/path/pic1.jpg"

# 7. 发表评论
python scripts/cli.py post-comment \
  --feed-id FEED_ID \
  --xsec-token XSEC_TOKEN \
  --content "评论内容"

# 8. 点赞
python scripts/cli.py like-feed \
  --feed-id FEED_ID --xsec-token XSEC_TOKEN
```

## 失败处理

- **未登录**：提示用户执行登录流程（xhs-auth）。
- **Chrome 未启动**：使用 `chrome_launcher.py` 启动浏览器。
- **操作超时**：检查网络连接，适当增加等待时间。
- **频率限制**：降低操作频率，增大间隔。
