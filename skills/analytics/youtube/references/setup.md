# YouTube Analytics 配置（youtube-analytics-cli）

基于 [Bin-Huang/youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli)，走官方 YouTube Data API v3 + Analytics API v2。

## 安装

```powershell
npm run youtube:stats-setup
npm run deps:check -- --platform youtube-analytics
```

## 认证

| 方式 | 用途 | 命令 |
|------|------|------|
| API Key | 公开频道 / 视频统计 | `channels <id>`、`videos <ids>` |
| OAuth 2.0 | 自家频道 Analytics 报表 | `report`、`groups`、无 ID 的 `channels` |

在 Hermes `.env`（或 profile `.env`）填写：

```bash
# 公开数据（与 TubePilot explore 可共用同一把 Key）
YOUTUBE_API_KEY=

# Analytics 报表（Desktop OAuth + refresh token）
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=
# YOUTUBE_REFRESH_TOKEN=
```

也可改用凭据文件（CLI 默认探测路径）：

```text
~/.config/youtube-analytics-cli/credentials.json
```

或命令级：`npm run youtube:stats -- --credentials D:\path\credentials.json ...`

### 申请 API Key

与 explore 相同：Google Cloud → 启用 **YouTube Data API v3** → 创建 API 密钥。  
见 [`youtube-explore-setup.md`](../../../../workspace/references/youtube-explore-setup.md)。

### 申请 OAuth（报表）

1. 同一 GCP 项目启用 **YouTube Analytics API**
2. 创建 OAuth 客户端（Desktop）
3. 用 [OAuth Playground](https://developers.google.com/oauthplayground/) 或自有流程换 `refresh_token`，scopes：
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/yt-analytics.readonly`
   - （收入指标可选）`https://www.googleapis.com/auth/yt-analytics-monetary.readonly`

Service Account **不能**用于 YouTube Analytics。

## 调用

```powershell
# 视频公开数据
npm run youtube:stats -- videos VIDEO_ID

# 频道公开数据
npm run youtube:stats -- channels UC...

# 自家频道概览（OAuth）
npm run youtube:stats -- channels

# 近 30 天日报表（OAuth）
npm run youtube:stats -- report `
  --metrics views,likes,subscribersGained `
  --start-date 2026-06-15 `
  --end-date 2026-07-15 `
  --dimensions day
```

## 与 explore 的区别

| | `explore/youtube` | `analytics/youtube`（本技能） |
|--|-------------------|------------------------------|
| 时机 | 发之前 | 发之后 / 自家账号复盘 |
| 对象 | 赛道爆款、竞品脚本 | 频道/作品统计与 Analytics 报表 |
| 工具 | TubePilot + score/extract | youtube-analytics-cli |

## 上游文档

- https://github.com/Bin-Huang/youtube-analytics-cli
