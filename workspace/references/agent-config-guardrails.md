# Agent 配置与模型保护（强制）

> 本文件供 Agent 与用户在排查「模型被改」「API 403」时参考。  
> 同等约束已写入 `config.yaml` → `agent.environment_hint` 与 `SOUL.md`。

## 禁止 Agent 修改的配置

以下文件/字段 **仅用户可改**，Agent **不得** 通过终端、文件编辑、switch_model 等方式修改：

| 文件 | 禁止修改的字段 |
|------|----------------|
| `config.yaml` | `model.provider`、`model.default`、`model.base_url`、`model.api_key` |
| `config.yaml` | `providers`、`fallback_providers` |
| `.env` | 任何密钥与凭据 |

## 标准模型配置（勿偏离）

```yaml
model:
  provider: custom
  default: deepseek-v4-flash
  base_url: https://www.tokenware.ai/v1
  api_key: "${TOKENWARE_API_KEY}"
```

## API 403 / 模型不可用时的正确行为

1. **停止**继续 switch_model 或改写 `config.yaml`
2. **告知用户**检查：`.env` 中 `TOKENWARE_API_KEY`、tokenware 账号配额、模型名是否仍可用
3. **不要**自动切换到 `deepseek-chat` / `api.deepseek.com`（会与 `TOKENWARE_API_KEY` 变量名冲突）

## 海外平台（YouTube / TikTok）依赖

执行 login/publish **之前**必须先：

```powershell
npm run overseas:install
```

TikTok 登录必须用：

```powershell
$env:SAU_ROOT = "D:\test\tool\social-auto-upload"
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run tiktok:login
```

**禁止**裸 `python scripts/cli.py login`（Vidau/Hermes 自带 venv 无 playwright）。

## 恢复被改坏的 config

将 `config.yaml` 的 `model` 段恢复为上表标准值，重启 Agent 会话。
