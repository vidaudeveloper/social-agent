---
name: x-auth
description: X/Twitter 登录与环境检查（baoyu-post-to-x Chrome profile）
---

# x-auth

```powershell
npm run x:login
npm run x:check-login
npm run x:preflight
```

Chrome 配置目录默认：`%APPDATA%\baoyu-skills\chrome-profile`（Windows）

## 登录与 cookie

1. `x:login` 只打开一次登录页，不轮询刷新
2. 登录完成后按 Enter → 脚本验证 `auth_token` + `ct0` 已写入 profile
3. **不要关闭 Chrome**——后续 publish 复用同一会话

## 验证

`x:check-login` 检测环境 + 登录 cookie（需 Chrome 仍打开且带 debug port）。
