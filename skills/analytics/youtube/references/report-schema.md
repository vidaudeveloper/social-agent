# YouTube 发布复盘 report.json

由 `npm run youtube:stats -- archive` 自动生成，结构对齐小红书复盘（数据 + 发现 + 建议）。

```json
{
  "title": "YouTube 频道作品数据全分析",
  "period": { "startDate": "2026-06-16", "endDate": "2026-07-15", "days": 30 },
  "channel": { "title": "...", "subscriberCount": "0", "videoCount": "2" },
  "summary": { "views": 1, "likes": 0, "comments": 0 },
  "videos": [{ "id": "...", "title": "...", "views": 1, "averageViewPercentage": 86.3 }],
  "findings": {
    "best": { "title": "「...」", "summary": "...", "reasons": ["..."] },
    "issues": [{ "problem": "...", "analysis": "..." }]
  },
  "suggestions": [
    { "title": "标题迭代方向", "items": [{ "bad": "...", "good": "..." }] },
    { "title": "封面与前 3 秒", "body": "..." }
  ]
}
```
