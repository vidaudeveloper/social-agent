# YouTube 发布参考

## CLI 入口

```powershell
node skills/publish/youtube/scripts/cli.mjs <command>
```

| npm 命令 | 说明 |
|----------|------|
| `npm run youtube:login` | 一次性 sau 登录 |
| `npm run youtube:check-login` | 检查 cookie（尽量少用） |
| `npm run youtube:publish` | 上传发布（日常主命令） |
| `npm run youtube:pipeline` | 全流程 |

## 单路径原则

- **仅 sau**：`social-auto-upload` 的 `sau youtube` 命令
- **唯一 cookie**：`tool/social-auto-upload/cookies/youtube_<account>.json`
- **已移除**：Playwright 回退、`CHROME_CDP_URL`、`YOUTUBE_PUBLISH_BACKEND`、PVA YouTube 补丁

## 国内网络

编辑 `tool/social-auto-upload/conf.py`：

```python
YT_PROXY = "http://127.0.0.1:7890"  # 改成你的代理端口
```

## 风控建议

1. **登录一次**，之后尽量只 `publish`
2. **少跑 check-login**；check 返回 invalid 时勿立即 re-login
3. **Agent 禁止**自动连跑 login/check（`OVERSEAS_ALLOW_AUTOMATION` 默认关闭）
4. check 失败间隔至少 30 分钟再试 login

## 目录结构

```
skills/publish/youtube/
├── SKILL.md
├── skills/yt-auth|yt-publish|yt-pipeline|youtube-upload/
├── scripts/cli.mjs
├── scripts/commands/     # auth.mjs, publish.mjs, pipeline.mjs
└── references/publishing.md

# TTS 口播创作（create 层，不在本目录）：
#   skills/create/video/tts-narration/yt-create/SKILL.md  (name: yt-create)

tool/social-auto-upload/
├── sau_cli.py
├── conf.py
└── cookies/youtube_default.json   ← 唯一登录态
```

## 故障排查

Hermes / Agent 遇到 sau 安装、check invalid、cookie 恢复等问题，**按顺序执行**：

→ [references/sau-runbook.md](references/sau-runbook.md)

## 不要用

- `pva youtube login/upload` — 已废弃，与 sau cookie 不互通

## 全流程

```powershell
node skills/publish/youtube/scripts/cli.mjs pipeline
```

产出归档在 `HERMES_ROOT`（默认 `./content`）。
