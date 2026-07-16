---
name: zh-publish
description: |
  知乎长文发布（MD→多段落 HTML→API）。避免 zhihu article 单 p 糊成一团。
  当用户要求发布知乎专栏、zhihu:publish 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [zhihu, publish]
    related_skills:
      - zh-skills
      - zh-auth
---

# 知乎发布（zh-publish）

## 技能边界

发布前建议：`npm run review:lint -- --platform zhihu --file <文稿>`

```powershell
npm run zhihu:convert -- --content-file "$HERMES_ROOT/文章/知乎/xxx.md"
npm run zhihu:publish -- --title "文章标题" --content-file "$HERMES_ROOT/文章/知乎/xxx.md"
```

详见总览 [`zh-skills`](../../SKILL.md)。
