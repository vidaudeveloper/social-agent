# Bug 修复记录

## 2026-07-03 — Hermes 误改模型 + TikTok login 缺 playwright

### 现象

1. Vidau 打包 profile 的 `config.yaml` 被从 `deepseek-v4-flash`（tokenware）改成 `deepseek-chat`（api.deepseek.com）
2. `python scripts/cli.py login` 报错 `No module named 'playwright'`
3. tokenware 偶发 403 后 Agent 尝试 switch_model，加剧配置混乱

### 根因

- Hermes/Vidau UI 切换模型会持久化写入 profile 的 `config.yaml`
- TikTok `tk_uploader` 依赖 `playwright`，但 sau 的 `pyproject.toml` 只声明了 `patchright`；裸 `python` 用的是 vidau-agent venv，未安装 sau 依赖
- profile 缺少 `npm run overseas:install` 入口，Agent 直接裸跑命令

### 修复

- 恢复 `config.yaml` 标准 model 配置；在 `agent.environment_hint` / `SOUL.md` / `workspace/references/agent-config-guardrails.md` 禁止 Agent 改 model
- 新增 `scripts/install-overseas-tools.ps1`、`package.json`（`overseas:install`、`tiktok:login`）
- 新增 `scripts/run-tiktok.mjs` 通过 `uv run --directory $SAU_ROOT` 调用 TikTok CLI

### 验证

```powershell
cd <profile-root>
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run tiktok:login
```
