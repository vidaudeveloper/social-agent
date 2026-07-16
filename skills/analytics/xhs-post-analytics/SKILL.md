---
name: xhs-post-analytics
description: |
  小红书发布后作品复盘。从创作者中心「内容分析 → 导出数据」xlsx 解析曝光/观看/CTR 等，
  自动生成关键发现与建议，落成 HTML + 下次创作参考。
  当用户要求分析已发布小红书作品数据、账号复盘、发文后数据报告并生成 HTML 时触发。
version: 1.1.0
metadata:
  hermes:
    tags: [xiaohongshu, analytics, post-publish, report, creator-export]
    related_skills:
      - publish/xiaohongshu
      - explore/xiaohongshu/xhs-explore
      - explore/xiaohongshu/xhs-research
      - create/pipeline-orchestrator
---

# 小红书发布后作品复盘（xhs-post-analytics）

发**之后**看自己的号与作品表现，并落盘 HTML。  
（发**之前**的竞品调研请用 `explore/xiaohongshu/xhs-research`。）

## 技能边界

- **主路径**：创作者中心导出 xlsx → `npm run xhs:stats -- archive`（**已实现**，含自动 `export-note-data`）
- **手喂 xlsx**：`npm run xhs:stats -- archive --in "<笔记列表明细表.xlsx>"`
- **手喂 JSON**：`npm run xhs:stats -- build --in <report.json>`（兼容旧流程）
- **工作目录**：必须在 **profile 仓库根**（含 `package.json`）执行 npm；勿在 `skills/publish/xiaohongshu/scripts` 子目录单独跑
- C 端 `user-profile` 留给竞品/外人主页，**不作为**自家发后复盘主数据源

## 已实现脚本（自检）

执行前可用下列命令确认环境已更新到含 `export-note-data` 的版本：

```powershell
# profile 根目录
npm run xhs:stats -- --help
npm run xhs:stats -- list

# 应能看到 export-note-data
uv run python skills/publish/xiaohongshu/scripts/cli.py export-note-data --help
```

| 文件 | 作用 |
|------|------|
| `skills/analytics/xhs-post-analytics/scripts/cli.mjs` | `archive` / `build` / `list` |
| `skills/analytics/xhs-post-analytics/scripts/archive.mjs` | 无 `--in` 时调 `export-note-data`，再解析 xlsx |
| `skills/analytics/xhs-post-analytics/scripts/parse_export.py` | 解析「笔记列表明细表」xlsx |
| `skills/publish/xiaohongshu/scripts/cli.py` | 子命令 `export-note-data` |
| `skills/publish/xiaohongshu/scripts/xhs/note_data_export.py` | Bridge 打开内容分析并点导出 |

## 工作流（推荐）

1. 确认 Chrome 已登录小红书 + XHS Bridge 可用（与发布同一套）
2. 一键复盘：

```powershell
# 自动打开内容分析 → 导出 → 解析 → HTML
npm run xhs:stats -- archive --days 30 --account "TK广告运营"

# 或用手点导出的本地文件（确认格式为 xlsx）
npm run xhs:stats -- archive --in "D:\GoogleDownload\笔记列表明细表.xlsx" --account "TK广告运营"
```

3. 对话交付：HTML 路径 + 下次创作参考路径 + 1–2 句结论

单独只导出文件：

```powershell
uv run python skills/publish/xiaohongshu/scripts/cli.py export-note-data --days 30
```

## 产出路径

```text
$HERMES_ROOT/知识库/xiaohongshu/发布复盘/{accountSlug}/
  {YYYY-MM-DD}_作品复盘.html
  {YYYY-MM-DD}_作品复盘.json
  {YYYY-MM-DD}_下次创作参考.md

$HERMES_ROOT/知识库/xiaohongshu/发布复盘/LATEST.json
```

## 下次创作怎么用

写下一篇前读：

- `发布复盘/LATEST.json` → `{date}_下次创作参考.md`
- 有前置调研时再叠加 `知识库/xiaohongshu/{topic}/创作参考.md`

## 与 xhs-research 区别

| | xhs-research | xhs-post-analytics（本技能） |
|--|--------------|------------------------------|
| 时机 | 发之前 | 发之后 |
| 对象 | 竞品/热点 | 自己账号作品 |
| 数据 | C 端公开页 | 创作者中心导出 xlsx |
| 命令 | `npm run xhs:research` | `npm run xhs:stats -- archive` |
