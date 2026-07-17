# 小红书发布后复盘

数据源：**创作者中心 → 数据洞察 → 内容分析 → 导出数据**（xlsx，如「笔记列表明细表」）。

```powershell
# 一键：自动导出 + 洞察 + HTML（需 Bridge / 已登录）
npm run xhs:stats -- archive --days 30 --account "账号昵称"

# 已有本地导出文件
npm run xhs:stats -- archive --in "D:\GoogleDownload\笔记列表明细表.xlsx" --account "账号昵称"

# 仅渲染已写好的 report.json
npm run xhs:stats -- build --in D:\tmp\xhs-post-report.json --account "账号昵称"

npm run xhs:stats -- list
```

产出：`$CONTENT_ROOT/知识库/xiaohongshu/发布复盘/{accountSlug}/{date}_作品复盘.html`
