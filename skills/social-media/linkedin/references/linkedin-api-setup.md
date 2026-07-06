# LinkedIn 官方 API 配置（个人号）

使用 LinkedIn **Share on LinkedIn** 产品与 **Posts API**，通过 OAuth 发帖（非浏览器爬取）。

## 1. 创建 LinkedIn 应用

1. 打开 [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. 创建 App，记录 **Client ID** / **Client Secret**
3. **Products** 中添加 **Share on LinkedIn**（获得 `w_member_social`）
4. **Auth** 标签 → **Redirect URLs** 添加：

```
http://127.0.0.1:8765/callback
```

（或与 `LINKEDIN_REDIRECT_URI` 一致）

## 2. Hermes `.env`

```bash
hermes config env-path
```

```
LINKEDIN_CLIENT_ID=你的ClientID
LINKEDIN_CLIENT_SECRET=你的ClientSecret
LINKEDIN_REDIRECT_URI=http://127.0.0.1:8765/callback
LINKEDIN_API_VERSION=202601
```

勿提交 Git。

## 3. 登录流程（人工确认）

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:login
```

1. 终端按 Enter → **打开浏览器授权页**（脚本不代填账号密码）
2. 你在浏览器中 **手动登录** 并点击 **授权**
3. 回到终端，按 Enter **确认保存令牌**
4. 单次检查：`npm run linkedin:check-login`（会再要你按 Enter 才请求 API）

## 4. 发布

```powershell
npm run linkedin:publish -- --file "$HERMES_ROOT/文章/LinkedIn/xxx.md" --visibility public
```

发布前会再次要求按 Enter 确认。

## 限制

- `w_member_social` 需在开发者后台开通；部分账号需 LinkedIn 审核
- 令牌约 60 天有效；有 `refresh_token` 时会自动刷新
- **公司主页** 需 `w_organization_social`，见 `company-page.md`（预留）

## 与旧方案区别

| | linkedin-cli（已弃用） | 官方 API（当前） |
|--|------------------------|------------------|
| 认证 | 读 Chrome Cookie | OAuth 2.0 |
| 发帖 | Playwright 点网页 | POST `/rest/posts` |
| 风控 | 易触发自动化检测 | 合规 API 调用 |
