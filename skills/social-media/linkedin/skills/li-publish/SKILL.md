---
name: li-publish
description: LinkedIn 个人号 Posts API 文本发帖。
version: 2.0.0
---

# LinkedIn 发布（Posts API）

```powershell
npm run linkedin:publish -- --file "$HERMES_ROOT/文章/LinkedIn/xxx.md"
npm run linkedin:publish -- --text "Hello" --visibility public
```

发布前须 `linkedin:login`；终端会要求 **按 Enter 确认** 后才调用 API。
