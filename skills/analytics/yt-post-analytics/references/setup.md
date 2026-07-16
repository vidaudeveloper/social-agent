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
2. 创建 OAuth 客户端（**Desktop / 桌面应用**），下载 `client_secret_*.json`
3. 把 JSON 中的 `client_id` / `client_secret` 写入 profile `.env`：
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
4. 换 `refresh_token`（推荐本仓一键）：

```powershell
npm run youtube:oauth
```

浏览器登录后会写回 `YOUTUBE_REFRESH_TOKEN`，并同步 `~/.config/youtube-analytics-cli/credentials.json`。

若回调失败：在 GCP → Clients → 该 Desktop 客户端里，给 Redirect URI 加上  
`http://127.0.0.1:17890/oauth2callback`。

Scopes（脚本已内置，勿强行加 monetary 除非要看收入）：
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/yt-analytics.readonly`

也可用 [OAuth Playground](https://developers.google.com/oauthplayground/)（齿轮里勾选自有 Client ID）手换 token。

#### 浏览器提示 “Google hasn't verified this app”

测试中的自用应用会看到这页，**不必做正式验证**。本机操作：

1. **不要**点蓝色 **Back to safety**
2. 点左侧灰色文字链接 **Continue**（有的界面要先点 **Advanced / 高级** 才出现 Continue）
3. 下一页勾选权限 → **Continue / Allow**
4. 授权成功后应跳到 `http://127.0.0.1:17890/...` 并显示「授权成功」

若 Continue 点了仍进不去 / 报 **access_denied**：

1. GCP → **Google Auth Platform** → **Audience**（或 OAuth consent screen）
2. 发布状态保持 **Testing**
3. **Test users** 里把你当前登录的 Gmail **加进去**（必须是授权时用的同一个号）
4. 关掉标签页后重新执行 `npm run youtube:oauth`

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

| | `explore/youtube` | `analytics/yt-post-analytics`（本技能） |
|--|-------------------|------------------------------|
| 时机 | 发之前 | 发之后 / 自家账号复盘 |
| 对象 | 赛道爆款、竞品脚本 | 频道/作品统计与 Analytics 报表 |
| 工具 | TubePilot + score/extract | youtube-analytics-cli |

## 上游文档

- https://github.com/Bin-Huang/youtube-analytics-cli
