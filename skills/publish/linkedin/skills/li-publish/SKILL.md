---
name: li-publish
description: |
  LinkedIn 单平台发布（publish-single，Posts API）。终端确认后才调用上游 CLI。
  触发：「只发 LinkedIn」「LinkedIn 发帖」「linkedin:publish」。
  口语：发 LinkedIn、LinkedIn 发个帖、上传 LinkedIn 图文。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [linkedin, publish]
    related_skills:
      - li-auth
      - li-analytics
      - pipeline-orchestrator
---

# LinkedIn 发布（li-publish / Posts API）

## When to use

- 已有文案/图，只发布到 LinkedIn

## When not to use

- 从选题到多平台分发 → **`pipeline-orchestrator`**
- 查发后数据 → **`li-analytics`**
- 只要登录 → **`li-auth`**

```powershell
npm run linkedin:publish -- --file "$CONTENT_ROOT/文章/LinkedIn/xxx.md"
npm run linkedin:publish -- --text "Hello" --visibility public
npm run linkedin:publish -- --text "标题" --image "./cover.jpg"
```

发布前须 `linkedin:login`；终端会要求 **按 Enter 确认** 后才调用上游 CLI 发帖。
