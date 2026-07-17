# 小红书 explore

| 技能 | 说明 |
|------|------|
| [`xhs-explore`](xhs-explore/) | 搜索 / 详情 / 首页 / 用户主页（拉数） |
| [`xhs-content-ops`](xhs-content-ops/) | 竞品 / 热点 / 创作 / 互动复合流程 |
| [`xhs-research`](xhs-research/) | **分析落盘**：HTML 报告 + 创作参考.md → `$CONTENT_ROOT/知识库/xiaohongshu/` |

## 报告留存（推荐）

```powershell
npm run xhs:research -- save-raw --topic <slug> --in <search.json> --keyword <kw>
npm run xhs:research -- save-details --topic <slug> --in <detail.json> --append
npm run xhs:research -- build --topic <slug> --keyword <kw>
```

下次写稿优先读：`知识库/xiaohongshu/{slug}/{slug}_创作参考.md` 或 `知识库/xiaohongshu/LATEST.json`。
