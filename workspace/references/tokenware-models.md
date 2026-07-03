# tokenware 聊天模型 ID 对照

> tokenware 的 `/v1/models` 返回的 **id** 与 OpenAI/DeepSeek 官方 slug **不一致**。  
> 填错会报 **HTTP 403**：`Model 'xxx' not found`（`permission_denied`）。

## 推荐默认（本 profile）

| 用途 | config.yaml `model.default` |
|------|----------------------------|
| 日常对话 / Agent | `DeepSeek：DeepSeek V4 Flash` |
| 更强推理（可选） | `DeepSeek：DeepSeek V4 Pro` |

注意：冒号为 **全角 `：`**（U+FF1A），不是半角 `:`。

## 错误示例（会 403）

| 错误 ID | 说明 |
|---------|------|
| `deepseek-v4-flash` | DeepSeek 官方 slug，tokenware 不认 |
| `deepseek-chat` | 仅适用于 `api.deepseek.com`，且与 `TOKENWARE_API_KEY` 不匹配 |

## VidAU 无法对话时（最常见）

**现象**：`config.yaml` 已是 `DeepSeek：DeepSeek V4 Flash`，但日志/请求里仍是 `deepseek-v4-flash` → 403。

**原因**：VidAU **会话创建时**会锁定 UI 里选的模型；改 config 不会自动改旧会话。

**处理（按顺序）**：

1. **新建对话**（不要继续用报 403 的旧会话）
2. 模型选择器里选 **custom / tokenware**，模型名须为 **`DeepSeek：DeepSeek V4 Flash`**
3. 不要选列表里的 `deepseek-v4-flash`（那是 catalog 别名，tokenware 不认）
4. 完全退出并重启 VidAU，再新建对话试「您好」

**全局配置**：`%LOCALAPPDATA%\vidau\config.yaml` 里 `custom_providers` 的 `model` 也须为  
`DeepSeek：DeepSeek V4 Flash`（已修正则跳过）。

## 路径说明

| 内容 | 路径 |
|------|------|
| VidAU 程序 | `D:\Program Files (x86)\vidau\` |
| social-agent profile | `%LOCALAPPDATA%\vidau\profiles\social-agent\` |
| profile 的 `.env` / `config.yaml` | 上表 profile 目录下 |

## 自查

确认 profile 的 `config.yaml` 含：

```yaml
model:
  provider: custom
  default: "DeepSeek：DeepSeek V4 Flash"
  base_url: https://www.tokenware.ai/v1
  api_key: "${TOKENWARE_API_KEY}"
custom_providers:
  - name: tokenware
    base_url: https://www.tokenware.ai/v1
    api_key: "${TOKENWARE_API_KEY}"
    model: "DeepSeek：DeepSeek V4 Flash"
```

查看最新失败原因：`profiles\social-agent\logs\agent.log` 搜索 `403` 或 `model=`。
