# 故障排查

> **Hermes / Agent 首选**：完整分步清单见 **[sau-runbook.md](../../references/sau-runbook.md)**（安装恢复、check invalid、登录、发布）。

## sau 命令找不到 / ModuleNotFoundError

→ 见 runbook **章节 A**

## check 返回 invalid（cookie 文件存在）

→ 见 runbook **章节 B**

## 需要重新登录

→ 见 runbook **章节 C**（勿连跑 login/check）

## 上传卡在进度条

→ 见 runbook **章节 D**

## Agent 反复 login/check 导致风控

- 保持 `OVERSEAS_ALLOW_AUTOMATION` 未设置（默认关闭）
- Agent 禁止连跑 `youtube:login` / `youtube:check-login`
- 见 `references/overseas-automation-rules.md`
