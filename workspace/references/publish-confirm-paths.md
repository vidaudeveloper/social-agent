# 发布前确认：绝对路径规范

> Step 5 发布前（或各平台 `publish` 前），**必须**向用户展示可打开的本地**绝对路径**。禁止只写「12 张卡片」「HTML 格式」等摘要。

## 必须先报

1. **`HERMES_ROOT` 实际值**（解析后的绝对路径，不是 `$HERMES_ROOT` 占位符）
2. **每个待发布平台**的文稿、配图/视频绝对路径
3. 缺失项及原因（如「知乎无封面：未配置 TOKENWARE_API_KEY」）

## 各平台发布用文件

| 平台 | 必须给出的路径 |
|------|----------------|
| 小红书 | 正文 `.md`、配图目录、`manifest.json`、`cover.png` + 全部 `card_*.png` |
| 知乎 | 发布用 **`.html`**（不是 `.md`）、封面图（有则给路径） |
| 公众号 | HTML/草稿文件、封面图 |
| 抖音/TikTok/YouTube | 视频 `.mp4`、口播稿 `.md`（如有） |
| LinkedIn/X/Reddit | 文稿 `.md` |

## 确认表示例

### Windows

```
HERMES_ROOT: D:\test\agent\hermes\social-agent-profile\content

小红书
- 标题: TK广告账户被封的5大原因
- 正文: D:\test\agent\hermes\social-agent-profile\content\文章\小红书\20260706_tk-ban.md
- manifest: D:\test\agent\hermes\social-agent-profile\content\图片\小红书\20260706_tk-ban\manifest.json
- 配图: D:\...\cover.png, D:\...\card_1.png … card_12.png（共 13 张）

知乎
- 标题: TK广告账户被封的5大原因 —— 2026年最新避坑指南
- HTML: D:\test\agent\hermes\social-agent-profile\content\文章\知乎\20260706_tk-ban.html
- 封面: （无，原因：未配置 TOKENWARE_API_KEY）
```

### macOS

```
HERMES_ROOT: /Users/you/projects/social-agent/content

小红书
- 标题: TK广告账户被封的5大原因
- 正文: /Users/you/projects/social-agent/content/文章/小红书/20260706_tk-ban.md
- manifest: /Users/you/projects/social-agent/content/图片/小红书/20260706_tk-ban/manifest.json
- 配图: /Users/you/.../cover.png, /Users/you/.../card_1.png … card_12.png（共 13 张）

知乎
- 标题: TK广告账户被封的5大原因 —— 2026年最新避坑指南
- HTML: /Users/you/projects/social-agent/content/文章/知乎/20260706_tk-ban.html
- 封面: （无，原因：未配置 TOKENWARE_API_KEY）
```

## 禁止

- 只用 `$HERMES_ROOT/文章/...` 占位符
- 只写风格/张数/格式，不给路径
- 知乎确认时只给 `.md` 不给 `.html`

## 相关

- 管线编排：`skills/social-media/pipeline-orchestrator/SKILL.md` Step 4.9
- 小红书发布：`skills/social-media/xiaohongshu/skills/xhs-publish/SKILL.md`
