# 小红书发布后复盘

```powershell
# 1) Agent 拉数并写出 report.json（schema 见 references/report-schema.md）
# 2) 生成 HTML
npm run xhs:stats -- build --in D:\tmp\xhs-post-report.json --account "账号昵称"

# 查看已有报告
npm run xhs:stats -- list
```

产出：`$HERMES_ROOT/知识库/xiaohongshu/发布复盘/{accountSlug}/{date}_作品复盘.html`
