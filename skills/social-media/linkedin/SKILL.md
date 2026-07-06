---
name: linkedin-skills
description: |
  LinkedIn 个人号官方 API 发帖（gxbvc/linkedin-cli · OAuth + Posts API）。打开授权页后须用户手动登录授权，终端确认后再发布。
  公司主页预留。当用户要求 LinkedIn API 发帖时触发。
version: 3.0.0
metadata:
  source: https://github.com/gxbvc/linkedin-cli
  status: untested
---

# LinkedIn Skills（未测试通过）

> 端到端发布尚未验证。文稿可生成到 `$HERMES_ROOT/文章/LinkedIn/`，**默认不自动发布**。

恢复时见 [references/linkedin-api-setup.md](./references/linkedin-api-setup.md)。

---

# LinkedIn Skills（gxbvc/linkedin-cli · 个人号）

## 流程原则

1. **可以**打开浏览器到 OAuth **授权页**
2. **禁止**脚本代填登录、禁止连跑 `check-login`
3. 用户手动登录并授权后，**终端按 Enter 确认** 才发布

## 安装与配置

```powershell
npm run linkedin:setup
```

见 [references/linkedin-api-setup.md](./references/linkedin-api-setup.md)

## 命令

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:login
npm run linkedin:check-login
npm run linkedin:publish -- --file "$HERMES_ROOT/文章/LinkedIn/post.md"
npm run linkedin:stats
```

## 公司主页

预留 `w_organization_social`，见 [references/company-page.md](./references/company-page.md)
