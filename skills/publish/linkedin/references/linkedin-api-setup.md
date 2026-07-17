# LinkedIn 官方 API 配置（个人号 · gxbvc/linkedin-cli）

使用上游 [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli)：官方 OAuth + Posts API（非浏览器爬取）。

## 1. 安装 CLI

```powershell
npm run linkedin:setup
```

默认 clone 到 `tool/linkedin-cli`（可用 `LINKEDIN_CLI_ROOT` 覆盖）。

## 2. 创建 LinkedIn 应用

1. 打开 [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. 创建 App，记录 **Client ID** / **Client Secret**
3. **Products** 中添加：
   - **Sign In with LinkedIn using OpenID Connect**（`openid` / `profile` / `email`）
   - **Share on LinkedIn**（`w_member_social`）
4. **Auth** → **Redirect URLs** 添加：

```
http://localhost:3457/callback
```

## 3. 项目 `.env`

```bash
项目 .env 路径
```

```
LINKEDIN_CLIENT_ID=你的ClientID
LINKEDIN_CLIENT_SECRET=你的ClientSecret
```

勿提交 Git。授权后 access/refresh token 与 person ID 会写入 `tool/linkedin-cli/.env`（亦勿提交）。

## 4. 登录流程（人工确认）

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:login
```

1. 终端按 Enter → 打开浏览器 OAuth 授权页
2. 你在浏览器中 **手动登录** 并点击 **授权**
3. 脚本自动 `profile --save` 保存 person ID
4. 检查：`npm run linkedin:check-login`（按 Enter 后各调一次 status + profile）

## 5. 发布

```powershell
npm run linkedin:publish -- --file "$CONTENT_ROOT/文章/LinkedIn/xxx.md" --visibility public
npm run linkedin:publish -- --text "Hello" --visibility public
npm run linkedin:publish -- --text "带图" --image "./cover.jpg"
```

发布前会再次要求按 Enter 确认。

## 6. 基础数据（互动统计 L1）

```powershell
npm run linkedin:stats
npm run linkedin:stats -- -n 20
```

列出近期帖子；单帖详情与互动数可用上游 CLI：`node tool/linkedin-cli/bin/linkedin.js posts get <post-urn>`。

深度曝光/触达分析需 LinkedIn Community Management API 合作伙伴权限，当前方案不包含。

## 限制

- `w_member_social` 需在开发者后台开通
- 访问令牌约 60 天；可用 `node tool/linkedin-cli/bin/linkedin.js auth refresh` 刷新
- **公司主页** 需 `w_organization_social`，见 `company-page.md`（预留）

## 与旧自研方案

| | 自研 scripts（已废弃） | gxbvc/linkedin-cli（当前） |
|--|------------------------|----------------------------|
| 维护 | VidAU 自维护 | 上游开源 + 薄包装 |
| OAuth 回调 | `127.0.0.1:8765` | `localhost:3457` |
| Scope | 曾缺 `email` 导致授权失败 | OIDC 完整 |
| 图片发帖 | 不支持 | `--image` 支持 |
