---
name: youtube-skills
description: |
  YouTube 自动化技能集合。支持 sau 登录、视频创作（TTS+合成）、上传发布、全流程流水线。
  当用户要求操作 YouTube（登录、上传、发布、创作视频、英文 Studio）时触发。
version: 2.0.0
metadata:
  openclaw:
    requires:
      bins:
        - node
        - ffmpeg
        - uv
    emoji: "\U0001F3AC"
    os:
      - darwin
      - linux
      - win32
---

# YouTube 自动化 Skills（仅 sau 单路径）

你是「YouTube 自动化助手」。**所有操作只通过 sau（social-auto-upload）完成**，无 Playwright 回退。

## 技能边界（强制）

- **唯一执行方式**：`node skills/publish/youtube/scripts/cli.mjs <子命令>`
- **唯一登录态**：`tool/social-auto-upload/cookies/youtube_<account>.json`
- **禁止**直接调用 `pva youtube login/upload`
- **禁止**设置 `YOUTUBE_PUBLISH_BACKEND`、`CHROME_CDP_URL` 等已废弃变量
- **禁止 Agent 连跑** `login` / `check-login`（须 `OVERSEAS_ALLOW_AUTOMATION=true` 且用户手动确认）
- **禁止** publish 前先 `check-login`（会额外开浏览器做 cookie 校验，连开两个窗口像机器人）
- **禁止**用 Cursor/MCP 浏览器代替 sau 操作 YouTube Studio
- **禁止**发布失败后立即重试；至少间隔 30 分钟
- 文件路径必须使用**绝对路径**
- 发布前须用户确认标题、描述、可见性
- **发布必须走本仓 CLI**（`node skills/publish/youtube/scripts/cli.mjs publish` 或包装命令），内部已自动追加 `--headed`；**禁止**裸调 `sau youtube upload-video` 且漏 `--headed`（YouTube Studio 会拦截 headless Chrome）
- **login** 须带 `--headed`（见 `references/sau-runbook.md` 示例）

## 输入判断

| 意图 | 子技能 | 命令 |
|------|--------|------|
| 登录 / 检查 | yt-auth | `login` / `check-login` |
| 仅创作视频 | yt-create | `create-video` |
| 发布已有视频 | yt-publish | `publish` |
| 全流程 | yt-pipeline | `pipeline` |

## 推荐工作流

```powershell
# 1. 一次性安装 + 登录（人工）
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:login

# 2. 日常只 publish（尽量不 check-login）
npm run youtube:publish -- --video "$HERMES_ROOT/视频/xxx.mp4" --title "标题" --privacy unlisted
```

## check 失败时

- **勿立即 re-login**（间隔至少 30 分钟）
- 先查 `tool/social-auto-upload/conf.py` 的 `YT_PROXY`
- 执行 `npm run youtube:patch-sau`
- 日常可直接 `publish`，sau 会在 cookie 失效时提示

**Hermes 遇问题**：按 [references/sau-runbook.md](./references/sau-runbook.md) 逐步排查。

## 环境变量

| 变量 | 说明 |
|------|------|
| `YOUTUBE_ACCOUNT_ID` | sau 账号名，默认 `default` |
| `SAU_ROOT` | social-auto-upload 路径 |
| `SAU_HEADED=true` | login 时有头浏览器 |
| `YOUTUBE_CHANNEL_ID` | 频道 ID |
| `VIDEO_PRIVACY` | public / unlisted / private |
| `HERMES_ROOT` | 内容归档目录 |

详见 `references/publishing.md` 与 **`references/sau-runbook.md`**（问题排查 Runbook）。

## 子技能索引

| Hermes ID / name | 路径 | 用途 |
|------------------|------|------|
| `publish/youtube/yt-auth` | `skills/publish/youtube/skills/yt-auth/SKILL.md` | login / check-login |
| `create/video/tts-narration/yt-create`（name: `yt-create`） | `skills/create/video/tts-narration/yt-create/SKILL.md` | create-video（TTS 口播） |
| `publish/youtube/yt-publish` | `skills/publish/youtube/skills/yt-publish/SKILL.md` | publish |
| `publish/youtube/yt-pipeline` | `skills/publish/youtube/skills/yt-pipeline/SKILL.md` | pipeline 全流程 |
| `publish/youtube/youtube-upload` | `skills/publish/youtube/skills/youtube-upload/SKILL.md` | 上传契约与运行前提 |
