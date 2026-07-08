---
name: x-skills
description: |
  X (Twitter) 自动化技能。基于 JimLiu/baoyu-skills 的 baoyu-post-to-x，支持常规帖、视频帖、X Article。
  当用户要求发布推特、发 X、tweet 时触发。
version: 1.0.0
metadata:
  source: https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-post-to-x
---

# X (Twitter) Skills

通过 **baoyu-post-to-x**（Chrome CDP）向 X 填稿发布。默认填稿后由用户确认再点 Post。

**会话策略**（重要）：
- Cookie 保存在 `%APPDATA%\baoyu-skills\chrome-profile`（Windows）
- 登录一次后长期有效；`check-login` 验证 `auth_token` + `ct0`
- **操作完成后保持 Chrome 打开**（默认 `X_CLOSE_BROWSER=false`），复用 debug 会话，避免频繁启停触发风控

## 技能边界

```powershell
node skills/x/scripts/cli.mjs <command>
```

## 子技能

| 技能 | 命令 | 功能 |
|------|------|------|
| x-auth | `login` / `check-login` / `preflight` | 登录与环境 |
| x-publish | `publish` | 常规帖 / 视频 / X Article |

## 快速开始

```powershell
npm run overseas:install
npm run x:login
node skills/x/scripts/cli.mjs publish --text "Hello from pipeline!" --image "$HERMES_ROOT/图片/X/cover.jpg"
node skills/x/scripts/cli.mjs publish --file "$HERMES_ROOT/文章/X/post.md"
```

## 与主流水线

social-agent 管线 Step 5 在 `user-profile.md` 中 `X: 启用` 时调用本包。

## 来源

上游技能：`tool/baoyu-skills/skills/baoyu-post-to-x/SKILL.md`
