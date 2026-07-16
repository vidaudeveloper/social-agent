---
name: dy-publish
description: |
  抖音视频发布（SAU + 系统 Chrome）。上传已有 MP4 到抖音。
  当用户要求抖音上传、douyin:upload、发抖音视频时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [douyin, publish, sau]
    related_skills:
      - dy-skills
      - dy-auth
      - dy-create
---

# 抖音发布（dy-publish）

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
