---
name: x-publish
description: 向 X 发布常规帖、视频帖或 X Article（baoyu-post-to-x）
---

# x-publish

```powershell
# 常规帖（≤280 字非 Premium；Premium 更长）
node skills/x/scripts/cli.mjs publish --text "Your post #hashtag" --image "path/to.jpg"

# 长文 Article（.md，需 X Premium）
node skills/x/scripts/cli.mjs publish --file "$HERMES_ROOT/文章/X/article.md"

# 视频帖
node skills/x/scripts/cli.mjs publish --text "Watch this" --video "$HERMES_ROOT/视频/clip.mp4"
```

默认仅填稿预览；加 `--submit` 或设置 `X_AUTO_SUBMIT=true` 可自动点击 Post。
