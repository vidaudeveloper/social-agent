---
name: dy-publish
description: |
  抖音单平台发布（publish-single，SAU + 系统 Chrome）。上传已有 MP4 到抖音。
  触发：「只发抖音」「上传这个视频到抖音」「douyin:upload」。
  口语：发抖音、抖音上传、把视频传到抖音。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [douyin, publish, sau]
    related_skills:
      - dy-skills
      - dy-auth
      - dy-create
---

# 抖音发布（dy-publish）

## When to use

- 已有 MP4，只发布到抖音；用户说「只发抖音」「上传这个视频」

## When not to use

- 需要先用 TTS/花字合成视频 → **`dy-create`**
- 从选题写到多平台分发 → **`pipeline-orchestrator`**
- 只检查登录态 → **`dy-auth`**

## 技能边界

```powershell
npm run overseas:install
npm run douyin:check
npm run douyin:upload -- --video "$HERMES_ROOT/视频/xxx/yyy.mp4" --title "标题 #话题"
```

- 前置：Chrome + 已 login（见 `dy-auth`）
- 成片请用 create 层 `dy-create` / `npm run pipeline:douyin`，本技能只负责上传
- 验证码须在同一 Chrome 窗口由用户完成；Agent 不得关浏览器

详见总览 [`dy-skills`](../../SKILL.md)。
