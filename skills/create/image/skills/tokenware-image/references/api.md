# tokenware 生图 API

## 端点

```
POST https://www.tokenware.ai/v1/images/generations
Authorization: Bearer {OPENAI_API_KEY}
Content-Type: application/json
```

Key 与 tokenware 聊天 API 共用，写入 Hermes `.env` 的 `OPENAI_API_KEY`。

## 推荐模型

| 模型 | 说明 |
|------|------|
| `gpt-image-2` | **默认**，质量与速度平衡 |
| `gpt-image-1` | 更快 |
| `imagen-4.0-generate-001` | Google Imagen，高质量 |

## 请求示例

```json
{
  "model": "gpt-image-2",
  "prompt": "现代信息图，TK小店选品，中文标题，扁平插画",
  "n": 1,
  "size": "1792x1024",
  "response_format": "url"
}
```

## 尺寸

| 用途 | size |
|------|------|
| 16:9 封面（知乎/公众号/抖音） | `1792x1024` |
| 3:4 竖版（小红书） | `1024x1792` |
| 1:1 | `1024x1024` |

## 注意

- `response_format=url` 返回的链接有时效，须立即下载到本地
- 请求 timeout 建议 ≥ 120 秒
- 出图约 30–60 秒，勿短 timeout 重试风暴
