# report.json schema（发布后复盘）

Agent 分析完成后写入该结构，再执行 `npm run xhs:stats -- build --in ...`。

```json
{
  "title": "小红书账号作品数据全分析",
  "dataNote": "注：互动数据来源于小红书实时的搜索结果和详情页",
  "account": {
    "nickname": "TK广告运营",
    "redId": "95080436079",
    "desc": "专注 TikTok 海外广告投放 · 信息流优化",
    "ipLocation": "新加坡",
    "fans": 1,
    "following": 2,
    "likedCollected": 19
  },
  "posts": [
    {
      "title": "Q3选品趋势：5个利润赛道",
      "publishedAt": "7月1日",
      "likedCount": 9,
      "collectedCount": 2,
      "commentCount": 0,
      "sharedCount": null,
      "imageCount": 5
    }
  ],
  "findings": {
    "best": {
      "title": "「Q3选品趋势：5个利润赛道」",
      "summary": "点赞9、收藏2，占总互动的 58%!",
      "reasons": [
        "选题切中了选品实操+数据支撑",
        "5张长图卡片，信息密度高、可直接保存"
      ]
    },
    "issues": [
      { "problem": "粉丝基数小", "analysis": "仅1个粉丝，冷启动期正常" }
    ]
  },
  "suggestions": [
    {
      "title": "标题迭代方向",
      "items": [
        {
          "bad": "TK广告账户被封的5大原因",
          "good": "刚开的TK账户3天就被封？90%的人踩了这5个坑"
        }
      ]
    },
    {
      "title": "首图优化",
      "body": "建议用大字+数字+对比色做封面"
    }
  ]
}
```
