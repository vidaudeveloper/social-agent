---
name: x-auth
description: |
  X/Twitter 登录与环境检查（focused-task）。baoyu-post-to-x Chrome profile。
  触发：「X 登录」「推特登录」「检查 X 登录态」「Twitter login」。
  口语：登 X、检查能不能发推、推特账号登录。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [x, twitter, auth]
    related_skills:
      - x-publish
---

# x-auth

## When to use

- 用户只要 X 登录/环境检查，或 publish 前发现未登录
- 典型说法：「X 登录」「检查推特登录」「baoyu 环境」

## When not to use

- 实际发帖 → **`x-publish`**
- 多平台流水线 → **`pipeline-orchestrator`**

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
