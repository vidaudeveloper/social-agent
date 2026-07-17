---
name: yt-upload
description: |
  YouTube 上传契约参考（sau 登录/校验/上传的运行前提与故障索引，非独立执行入口）。
  触发：排障时查阅；实际发布仍用 `yt-publish`，登录用 `yt-auth`。
  口语：YouTube 上传报错、sau check invalid、上传前提检查。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [youtube, upload, sau, reference]
    related_skills:
      - yt-publish
      - yt-auth
---

# YouTube 上传 Skill（yt-upload / sau）

## When to use

- 排障：sau 报错、check invalid、上传前提缺失时查本页

## When not to use

- 日常发布 → **`yt-publish`**；日常登录 → **`yt-auth`**（本技能是参考契约，不是执行入口）

**唯一路径**。与抖音 / 小红书 SAU 上传模式一致。

## 功能概览

| 功能 | 命令 | 说明 |
| --- | --- | --- |
| 登录 | `sau youtube login --account <name>` | 一次性，cookie 存 `cookies/` |
| 校验 | `sau youtube check --account <name>` | 输出 `valid` / `invalid`（尽量少用） |
| 上传 | `sau youtube upload-video ...` | 日常主命令 |

封装 CLI：

```powershell
node skills/publish/youtube/scripts/cli.mjs login
node skills/publish/youtube/scripts/cli.mjs check-login
node skills/publish/youtube/scripts/cli.mjs publish --video "D:/..." --title "标题"
```

## 默认工作流

1. `npm run overseas:install` 安装 sau
2. 配置 `conf.py`（国内设 `YT_PROXY`）
3. **login 一次**
4. 日常 **只 publish**

## 执行前检查

- `uv run --directory tool/social-auto-upload sau youtube --help` 可用
- `YOUTUBE_ACCOUNT_ID` 账号名（默认 `default`）

## 参考文档

- **问题排查 Runbook（VidAU 首选）**：`references/sau-runbook.md`
- 运行前提：`references/runtime-requirements.md`
- CLI 契约：`references/cli-contract.md`
- 故障索引：`references/troubleshooting.md`
