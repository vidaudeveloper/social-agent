---
name: li-publish
description: |
  LinkedIn 个人号 Posts API 发帖。终端确认后才调用上游 CLI。
  当用户要求 LinkedIn 发帖、linkedin:publish 时触发。
version: 1.0.0
---

# LinkedIn 发布（li-publish / Posts API）

```powershell
npm run linkedin:publish -- --file "$HERMES_ROOT/文章/LinkedIn/xxx.md"
npm run linkedin:publish -- --text "Hello" --visibility public
npm run linkedin:publish -- --text "标题" --image "./cover.jpg"
```

发布前须 `linkedin:login`；终端会要求 **按 Enter 确认** 后才调用上游 CLI 发帖。
