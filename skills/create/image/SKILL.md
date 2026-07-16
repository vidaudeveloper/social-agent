---
name: img-skills
description: |
  配图总览（不进 Hub）。索引小红书卡片渲染与 tokenware AI 生图两条路径。
  触发：仅作索引；实际配图用 `xhs-card-render`（小红书优先）或 `img-tokenware`（其它平台/降级）。
  口语：配图能力总览、生图体系说明。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [image, tokenware, pipeline, overview]
    related_skills:
      - xhs-card-render
      - img-tokenware
---

# Image Skills（img-skills）

配图子技能，供 social-agent 管线 Step 4c 使用。中层目录仍为 `create/image/`。

## When to use

- 需要配图子技能总览、两条路径的分工说明

## When not to use

- 已明确要配图 → 直接用 `xhs-card-render`（小红书）或 `img-tokenware`（其它/降级），本总览不进 Hub

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
