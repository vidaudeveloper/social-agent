---
name: wechat-publish
description: 将 Markdown 文稿发布到微信公众号草稿箱（默认），或可选 freepublish 正式发布。
---

# wechat-publish

```powershell
npm run wechat:publish -- --file <article.md> [--cover cover.png] [--mode draft_only|full_publish]
```

## 模式

| mode | 行为 |
|------|------|
| `draft_only`（默认） | 创建草稿，返回 `media_id`；人工在 mp 后台群发 |
| `full_publish` | 草稿后调 freepublish；需人工验收首页可见性 |

## 成功判据

- draft：有效 `media_id`
- full：另有 `publish_id`；仍须对照后台确认运营可见成功
