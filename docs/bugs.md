# Bug 修复记录

> 运行规则见 `workspace/references/`；本文件只记录**已修复问题**的背景，供排障参考。

## 2026-07-16 — TTS 主线与 MCP 依赖说明漂移

**现象**：`creative-agent-routing.md`、`README.md` 仍将 TTS 口播标为默认成片方式；Agent 可能误选 `tts-narration`。`dependency-policy.md` 写「禁止 MCP」过于笼统，与 YouTube 爆款分析必需的 TubePilot MCP 冲突。

**根因**：视频主线改为 Remotion / creative-agent 后，reference 未同步；MCP 允许/禁止边界未分层说明。

**修复**：
- 更新 `creative-agent-routing.md`、`README.md` 视频表，TTS 标为已弃用
- `dependency-policy.md` 增加「能力 MCP vs 浏览器 MCP」边界，TubePilot 配置链接 `youtube-explore-setup.md`
- `skill-routing.md` 增加按意图的上下文读取顺序，避免 Agent 自行拼接全局读取流水线

**验证**：`npm run skill-routing:eval`

## 2026-07-16 — user-profile 路径不一致

**现象**：`pipeline-orchestrator` Step 0 写读 `workspace/user-profile.md`，`SOUL.md` 与其它 skill 写仓库根 `user-profile.md`。

**修复**：统一为仓库根 `user-profile.md`。
