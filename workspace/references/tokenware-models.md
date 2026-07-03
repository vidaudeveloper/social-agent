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
| `deepseek-v4-flash` | DeepSeek 官方 slug，tokenware 不识别 |
| `deepseek-chat` | 仅适用于 `api.deepseek.com`，且与 `TOKENWARE_API_KEY` 不匹配 |

## 自查命令

在 profile 根目录（不打印 Key）：

```powershell
python scripts/probe-tokenware-models.py
type cache\tokenware_deepseek_models.json
```

冒烟测试（需 `.env` 中 `TOKENWARE_API_KEY` 已填）：

```powershell
python scripts/test-tokenware-chat.py
```

## VidAU 安装路径说明

- 程序：`D:\Program Files (x86)\vidau\`
- **profile / .env / config**：`%LOCALAPPDATA%\vidau\profiles\social-agent\`

改模型请编辑 **AppData 下** 的 `config.yaml`，不是 Program Files 目录。
