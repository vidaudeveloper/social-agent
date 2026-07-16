---
name: zh-publish
description: |
  知乎单平台发布（publish-single，MD→多段落 HTML→API）。避免 zhihu article 单 p 糊成一团。
  触发：「只发知乎」「知乎专栏发布」「zhihu:publish」。
  口语：发知乎、知乎长文发布、发一篇专栏。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [zhihu, publish]
    related_skills:
      - zh-skills
      - zh-auth
      - pipeline-orchestrator
---

# 知乎发布（zh-publish）

## When to use

- 已有文稿，只发布到知乎

## When not to use

- 从选题写到多平台分发 → **`pipeline-orchestrator`**
- 只要登录检查 → **`zh-auth`**

## 技能边界

发布前建议：`npm run review:lint -- --platform zhihu --file <文稿>`

```powershell
npm run zhihu:convert -- --content-file "$HERMES_ROOT/文章/知乎/xxx.md"
npm run zhihu:publish -- --title "文章标题" --content-file "$HERMES_ROOT/文章/知乎/xxx.md"
```

详见总览 [`zh-skills`](../../SKILL.md)。
