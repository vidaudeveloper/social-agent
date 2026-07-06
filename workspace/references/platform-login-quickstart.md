# 各平台登录操作速查

> 用户一眼看清「我要动手做什么」；Agent 指导登录时引用本页，不要省略步骤。

**原则**：能走 API 的配密钥；要浏览器的，都是**你本人在 Chrome 里登录**，脚本不代填密码。

**端到端验证状态**（2026-07-06）：✅ 知乎、小红书、Reddit、YouTube、TikTok；⏳ 抖音、公众号、LinkedIn、X 尚未测试通过。

---

## 速查表

| 平台 | 端到端 | 一次性准备 | 你需要做什么 | 验证命令 |
|------|--------|------------|--------------|----------|
| **知乎** | ✅ | `uv tool install pyzhihu-cli` | 终端跑 login，**浏览器扫码** | `npm run zhihu:check-login` |
| **小红书** | ✅ | 装 XHS Bridge 扩展 + `uv sync` | App 扫码或短信验证码登录；发布时 Chrome 保持已登录创作中心 | `python scripts/cli.py check-login` |
| **YouTube** | ✅ | `npm run overseas:install` | 有头 login → **浏览器登 Google** → 终端 **Enter** | cookie 在 `tool/social-auto-upload/cookies/` |
| **TikTok** | ✅ | `overseas:install` + `TK_PROXY`（国内） | 有头 login → **浏览器登 TikTok** → 终端 **Enter** | `npm run tiktok:check-login` |
| **Reddit** | ✅ | `npm run reddit:setup` + 装扩展 | Chrome 登 Reddit；**界面必须 English** | `npm run reddit:check-login` |
| **公众号** | ⏳ | `.env` 配 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | **无浏览器登录**；API 进草稿箱，你在公众平台后台发布 | — |
| **抖音** | ⏳ | PVA + ffmpeg | Chrome **手动登录**抖音创作者中心，保持登录态 | 上传时浏览器内确认 |
| **LinkedIn** | ⏳ | `linkedin:setup` + `.env` OAuth | 授权页 **手动登录授权** → 终端 **Enter** | `npm run linkedin:check-login` |
| **X** | ⏳ | baoyu-post-to-x | Chrome **手动登 X**；默认只出稿 | `node skills/x/scripts/cli.mjs check-login` |

---

## 小红书

1. Chrome → `chrome://extensions/` → 开发者模式 → 加载 `skills/social-media/xiaohongshu/extension/`
2. `cd skills/social-media/xiaohongshu` → `uv sync`
3. `python scripts/cli.py check-login`
4. 未登录：**小红书 App 扫二维码**（或短信验证码，手机号须你确认）
5. 发布：Chrome 保持打开且已登录；发布后默认跳转创作中心首页验收

配图工具（非登录）：`npm run tool:install` → `npm run pipeline:xhs`

---

## 知乎

```powershell
uv tool install pyzhihu-cli
npm run zhihu:login          # 浏览器扫码
npm run zhihu:check-login
```

---

## 公众号

在 Hermes `.env` 配置服务号 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`。  
发布走 API 进**草稿箱**，你在 [微信公众平台](https://mp.weixin.qq.com/) 后台审阅后群发。

---

## 抖音

1. 安装 `@panda-video-automation/pva`、`ffmpeg`
2. Chrome 打开创作者平台并**手动登录**
3. `npm run douyin:upload -- --video <mp4绝对路径> --title "标题"`

---

## YouTube / TikTok（海外）

```powershell
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
```

**YouTube**：`node skills/youtube/scripts/cli.mjs login` → 浏览器登录 → Enter  
**TikTok**：`npm run tiktok:login` → 浏览器登录 → Enter（国内先配 `TK_PROXY`）

禁止 Agent 连跑 login/check-login；cookie 失效须你手动重登，间隔 ≥30 分钟。

---

## Reddit

```powershell
npm run reddit:setup
```

1. Chrome 加载 `tool/reddit-skills/extension/`
2. Reddit 网页语言 → **English**
3. 浏览器登录 Reddit
4. `npm run reddit:check-login`

---

## LinkedIn（未测试通过）

```powershell
npm run linkedin:setup
```

`.env` 配置 `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`  
`npm run linkedin:login` → 授权页手动登录 → Enter  
**默认只出稿，不自动发布。**

---

## X (Twitter)（未测试通过）

默认只出稿。`node skills/x/scripts/cli.mjs login` → Chrome 登录 X → 用户明确要求时再尝试发布。

---

## Agent 汇报登录态时

对每个待发布平台输出一行：`平台 | 已登录 / 需扫码 / 仅 API / 未配置`，并附上本页对应章节链接。
