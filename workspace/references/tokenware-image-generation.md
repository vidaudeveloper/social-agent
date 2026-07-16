# Tokenware AI 生图

> 配图请加载 **`img-tokenware`** 技能（`skills/create/image/skills/img-tokenware/SKILL.md`）。  
> 本文件为 Tokenware API 速查；完整流程见子技能文档。

## 调用地址

```
POST https://www.tokenware.ai/v1/images/generations
```

认证：`Authorization: Bearer {OPENAI_API_KEY}`（Hermes `.env`，`hermes config env-path`）

## CLI（推荐）

```powershell
npm run image:generate -- --platform zhihu --prompt "..." --out "$HERMES_ROOT/图片/知乎/cover.png"
# 等效：uv run python skills/create/image/scripts/cli.py generate ...
npm run image:check-key
```

## 可用模型

| 模型ID | 说明 |
|--------|------|
| `gpt-image-2` | **默认** |
| `gpt-image-1` | 更快 |
| `imagen-4.0-generate-001` | Google Imagen |

## 尺寸对照

| 用途 | size |
|------|------|
| 知乎/公众号/抖音封面 | `1792x1024` |
| 小红书卡片 | `1024x1792` |
| 正方形 | `1024x1024` |

## 注意

- URL 有时效，生成后立即下载到 `$HERMES_ROOT/图片/{平台}/`
- timeout ≥ 120 秒
