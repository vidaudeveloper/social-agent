---
name: image-skills
description: |
  社媒流水线配图技能包。内置 tokenware-image：tokenware.ai gpt-image-2 生封面/卡片/插图。
version: 1.0.0
metadata:
  hermes:
    tags: [image, tokenware, pipeline]
---

# Image Skills

配图子技能，供 `auto-content-pipeline` Step 4c 使用。

## 子技能

| 技能 | 说明 |
|------|------|
| **xhs-card-render** | 小红书 `pipeline:xhs`（MD→卡片 PNG，非 AI） |
| **tokenware-image** | 知乎/公众号/抖音封面（tokenware API） |

## 快速开始

```powershell
npm run image:check-key
npm run image:generate -- --platform wechat --prompt "公众号封面，科技风" --out "D:/test/hermes/图片/公众号/cover.png"
```

## Hermes 加载

Step 4c：小红书**先** `skill_view("xhs-card-render")` → `npm run pipeline:xhs`；pipeline 失败后可降级 `tokenware-image`（交互须用户确认）。其他平台直接用 `tokenware-image`。
