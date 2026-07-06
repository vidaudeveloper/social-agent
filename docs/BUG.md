# 变更与修复记录

## 2026-07-06 — LinkedIn 改用 gxbvc/linkedin-cli

**现象**：自研 OAuth 仅请求 `openid` 或 scope 不完整时，授权回调 `openid_insufficient_scope_error`。

**修复**：废弃 `skills/social-media/linkedin/scripts/` 自研 CLI，接入上游 [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli)；新增 `npm run linkedin:setup` / `run-linkedin.mjs`。Redirect URL 改为 `http://localhost:3457/callback`。

## 2026-07-06 — 开源合规与文档统一

- 统一安装仓库为 `vidaudeveloper/social-agent`
- 新增 `LICENSE`、`NOTICE.md`；清理子 skill 引流与旧仓库地址
- 路径占位符：`$HERMES_ROOT` / `./content`

## 2026-07-03 — tokenware 403：模型 ID

**现象**：首条对话 403，`Model 'deepseek-v4-flash' not found`

**根因**：tokenware 模型 ID 为 `DeepSeek：DeepSeek V4 Flash`（全角冒号），非官方 slug。

**修复**：`config.yaml` 使用正确模型名；详见 `workspace/references/tokenware-models.md`。旧会话可能锁定错误模型，需新建对话。

## 2026-07-03 — 海外工具与配置保护

**现象**：TikTok login 缺 playwright；Agent 误改 `config.yaml` model 段。

**修复**：新增 `npm run overseas:install`、`scripts/run-tiktok.mjs`；`SOUL.md` 与 `agent-config-guardrails.md` 禁止 Agent 改 model。
