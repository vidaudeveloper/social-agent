---
name: xhs-post-analytics
description: |
  小红书发布后作品复盘。把账号概况、作品互动、关键发现与优化建议落成 HTML + 下次创作参考。
  当用户要求分析已发布小红书作品数据、账号复盘、发文后数据报告并生成 HTML 时触发。
version: 1.0.0
metadata:
  hermes:
    tags: [xiaohongshu, analytics, post-publish, report]
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

- **拉数**：`python skills/publish/xiaohongshu/scripts/cli.py user-profile` + 必要时 `get-feed-detail` / `search-feeds`
- **出报告**：`npm run xhs:stats -- build --in <report.json>`
- 分析结论由 Agent 整理进 `report.json` 后**必须** build；禁止只聊不落盘

## 工作流

1. 拉账号主页：`user-profile --user-id ... --xsec-token ...`
2. 汇总近 N 篇作品互动（赞/藏/评/分享/图数/发布时间）
3. 写出 `report.json`（schema 见 `references/report-schema.md`）
4. 生成报告：

```powershell
npm run xhs:stats -- build --in D:\tmp\xhs-post-report.json --account "TK广告运营"
```

5. 对话交付：HTML 路径 + 下次创作参考路径 + 1–2 句结论（勿贴长文）

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
| 命令 | `npm run xhs:research` | `npm run xhs:stats` |
