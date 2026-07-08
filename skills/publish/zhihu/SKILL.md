---
name: zhihu-skills
description: |
  知乎长文发布（HTML 版）。将 .md 转为多段落 HTML，经 pyzhihu-cli API 直发，避免 zhihu article 单 <p> 导致整篇糊成一坨。
  当用户要求发布知乎专栏、zhihu publish 时触发。
version: 1.0.0
metadata:
  source: pyzhihu-cli + social-agent
---

# 知乎 Skills（HTML 发布）

> **写稿与格式规则**以 [`review/rules/zhihu.yaml`](../../review/rules/zhihu.yaml) 为准；发布前建议 `npm run review:lint -- --platform zhihu --file <文稿>`。

## 为何不用 `zhihu article` 直传 .md

`pyzhihu-cli` 的 `zhihu article` 会把整篇正文包进**一个** `<p>`，Markdown 空行分段会全部折叠。本技能改为：

1. `.md` / 纯文本 → 多 `<p>` 段落 HTML（`**加粗**` → `<strong>`）
2. 调用 `publish.py` 直连接知乎 API（不再经 CLI 单段包裹）

## 前置

```powershell
uv tool install pyzhihu-cli
npm run zhihu:login
npm run zhihu:check-login
```

## 命令

```powershell
# 只转 HTML（预览）
npm run zhihu:convert -- --content-file "$HERMES_ROOT/文章/知乎/xxx.md"

# 从 .md 转换并发布
npm run zhihu:publish -- --title "文章标题" --content-file "$HERMES_ROOT/文章/知乎/xxx.md"

# 已有 HTML 直接发
npm run zhihu:publish -- --title-file "D:/tmp/title.txt" --html-file "$HERMES_ROOT/文章/知乎/xxx.html"

# 带封面图
npm run zhihu:publish -- --title "标题" --content-file "xxx.md" --image "$HERMES_ROOT/图片/知乎/cover.png"

# 只生成 HTML 不发
npm run zhihu:publish -- --title "标题" --content-file "xxx.md" --dry-run
```

转换后的 HTML 默认与源文件同目录：`xxx.md` → `xxx.html`

## 文稿归档

`$HERMES_ROOT/文章/知乎/{日期}_{slug}.md`（母稿）  
`$HERMES_ROOT/文章/知乎/{日期}_{slug}.html`（发布用 HTML）

## 写稿建议

- 章节标题用 `**一、背景**`，不要用 `##`
- 段间空行分段；表格改自然语言
- 首行 `# 标题` 会作为文章标题剥离，请用 `--title` 传入正式标题
