---
name: img-skills
description: |
  社媒流水线配图技能包。内置 img-tokenware（tokenware.ai gpt-image-2）生封面/卡片/插图。
version: 1.0.0
metadata:
  hermes:
    tags: [image, tokenware, pipeline]
---

# Image Skills（img-skills）

配图子技能，供 social-agent 管线 Step 4c 使用。中层目录仍为 `create/image/`。

## 子技能

| 技能 | 说明 |
|------|------|
| **xhs-card-render** | 小红书 `pipeline:xhs`（MD→卡片 PNG，非 AI） |
| **img-tokenware** | 知乎/公众号/抖音封面（tokenware API） |

## 快速开始

```powershell
npm run image:check-key
npm run image:generate -- --platform wechat --prompt "公众号封面，科技风" --out "$HERMES_ROOT/图片/公众号/cover.png"
```

## Hermes 加载

Step 4c：小红书**先** `skill_view("xhs-card-render")` → `npm run pipeline:xhs`；pipeline 失败后可降级 `img-tokenware`（交互须用户确认）。其他平台直接用 `img-tokenware`。
