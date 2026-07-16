# 依赖安装策略（按需 / hint-only）

> Agent 缺依赖时**只报缺 + 给出 fix 命令 + 停止**，等用户确认后再执行安装。禁止自动 clone 其他仓库或使用 MCP/Playwright 浏览器替代本 profile CLI。

## 按需安装映射

| 平台/能力 | marker 文件 | fix 命令 | 约首次耗时 |
|-----------|-------------|----------|------------|
| 小红书卡片 | `tool/Auto-Redbook-Skills/scripts/render_xhs.py` | `npm run tool:install` | 5–12 min |
| YouTube / TikTok | `tool/social-auto-upload/sau_cli.py` | `npm run overseas:install` | 8–15 min |
| X (Twitter) | `tool/baoyu-skills/skills/baoyu-post-to-x/scripts/x-browser.ts` | `npm run x:setup` | 1–4 min |
| Reddit | `tool/reddit-skills/scripts/cli.py` | `npm run reddit:setup` | 2–5 min |
| LinkedIn | `tool/linkedin-cli/dist/cli.js` | `npm run linkedin:setup` | 3–6 min |
| 知乎 CLI | 系统 PATH 有 `zhihu` | `uv tool install pyzhihu-cli` | ~1 min |
| 抖音 | `tool/social-auto-upload/sau_cli.py` | `npm run overseas:install` | 与 YouTube/TikTok 共用 SAU |
| YouTube explore | `uv` + `youtube-transcript-api`；TubePilot MCP | `uv pip install youtube-transcript-api` + 配置 MCP | ~1 min |
| YouTube Analytics | `tool/youtube-analytics-cli/node_modules/youtube-analytics-cli/dist/index.js` | `npm run youtube:stats-setup` | ~1 min |
| 公众号 | Node 内置 `fetch` + `.env` 密钥（无额外安装） | 配置 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` + IP 白名单 | — |

检查命令：`npm run deps:check -- --platform xhs-card,youtube,tiktok,x,reddit,linkedin,zhihu,douyin,youtube-explore,youtube-analytics`  
公众号验密钥：`npm run wechat:check-login`

## Playwright 使用范围

| 用途 | 安装来源 |
|------|----------|
| 小红书 MD→模板 PNG 卡片 | `npm run tool:install`（Auto-Redbook） |
| YouTube / TikTok / **抖音** | `npm run overseas:install`（SAU） |

**抖音**：发布用 **系统 Chrome** + `npm run douyin:login|check|upload`。**已移除 PVA**（禁止 `douyin:setup` / `npx pva`）。

**不用浏览器自动化 CLI**：X（baoyu CDP）、Reddit（扩展桥）、LinkedIn（API）、知乎（HTTP API）。

| 方案 | 类型 | 优先级 |
|------|------|--------|
| xhs-card-render（Auto-Redbook） | 模板 MD→PNG | **默认首选** |
| img-tokenware | AI 生图（Tokenware） | `pipeline:xhs` 失败且**用户确认**后降级 |
| baoyu | — | **本 profile 未接入**小红书卡片 |

## Agent 禁止行为（缺依赖时）

1. 禁止 clone 其他 GitHub 项目替代上表指定工具
2. 禁止用 Cursor/MCP/Playwright 浏览器代替平台 CLI
3. 禁止起手 tokenware 替代 xhs-card-render
4. 禁止裸 `python` / 裸 `npx` 绕过 profile 包装脚本（如 `run-tiktok.mjs`）

## 缺依赖时的唯一动作

1. 报缺哪个 platform、哪个 marker 路径
2. 输出对应 fix 命令
3. **停止**，等用户确认后再安装
4. 安装后执行 `npm run deps:check -- --platform ...` 验证

## 相关文档

- 平台状态：[`platform-status.md`](platform-status.md)
- 登录速查：[`platform-login-quickstart.md`](platform-login-quickstart.md)
