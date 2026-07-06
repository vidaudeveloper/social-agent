# 变更与修复记录

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
