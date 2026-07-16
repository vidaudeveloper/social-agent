# report.json schema（发布后复盘）

主路径：`npm run xhs:stats -- archive` 从创作者中心导出 xlsx 自动生成。  
兼容：`build --in report.json` 手喂 JSON。

```json
{
  "title": "小红书账号作品数据全分析",
  "dataNote": "注：互动与曝光等数据来源于创作者中心「内容分析 → 导出数据」xlsx",
  "account": {
    "nickname": "TK广告运营",
    "redId": "95080436079",
    "desc": "可选",
    "fans": 1
  },
  "period": {
    "sourceFile": "D:\\\\tmp\\\\xhs-creator-exports\\\\笔记列表明细表.xlsx",
    "startDate": "2026-06-16",
    "endDate": "2026-07-15"
  },
  "summary": {
    "postCount": 3,
    "impressions": 1200,
    "views": 400,
    "likedCount": 12,
    "commentCount": 1,
    "collectedCount": 5,
    "fanGrowth": 0,
    "sharedCount": 2
  },
  "posts": [
    {
      "title": "Q3选品趋势：5个利润赛道",
      "publishedAt": "2026-07-01 10:00:00",
      "genre": "图文",
      "impressions": 500,
      "views": 180,
      "coverCtr": 10.5,
      "likedCount": 9,
      "collectedCount": 2,
      "commentCount": 0,
      "fanGrowth": 0,
      "sharedCount": 1,
      "avgWatchDurationSec": 12,
      "danmakuCount": 0
    }
  ],
  "findings": {
    "best": {
      "title": "「Q3选品趋势：5个利润赛道」",
      "summary": "曝光500 / 观看180 / CTR 10.5%",
      "reasons": ["…"]
    },
    "issues": [
      { "problem": "…", "analysis": "…" }
    ]
  },
  "suggestions": [
    {
      "title": "标题迭代方向",
      "items": [{ "bad": "旧标题", "good": "新标题" }]
    }
  ]
}
```

## 字段说明（posts）

| 字段 | 来源列 | 说明 |
|------|--------|------|
| title | 笔记标题 | |
| publishedAt | 首次发布时间 | 规范为 `YYYY-MM-DD HH:mm:ss` |
| genre | 体裁 | 图文/视频 |
| impressions | 曝光 | |
| views | 观看量 | |
| coverCtr | 封面点击率 | 导出多为 0~1，解析后为 0~100 百分数 |
| likedCount / commentCount / collectedCount / sharedCount | 点赞/评论/收藏/分享 | |
| fanGrowth | 涨粉 | |
| avgWatchDurationSec | 人均观看时长 | 秒 |
| danmakuCount | 弹幕 | 视频可能有 |
