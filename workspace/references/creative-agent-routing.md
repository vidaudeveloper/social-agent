# creative-agent 视频路由

本 profile（social-agent）与 [creative-agent](https://github.com/vidaudeveloper/creative-agent) 分工如下。

## 何时用 social-agent（本 profile）

- **纯文字 + 旁白** 口播视频：`dy-create` / `tt-create` / `yt-create`（Edge TTS + ffmpeg）
- 社媒全文管线：选题 → 写稿 → 配图 → 多平台发布

## 何时切换到 creative-agent profile

- 趋势短片、产品 URL 成片、批量编排、需要 MCP 创意能力时
- 仓库：https://github.com/vidaudeveloper/creative-agent
- MCP（可选）：`https://creative.vidau.info/mcp`（见 creative-agent 文档 `docs/SETUP.md`）

## 操作方式

1. 在 VidAU 中安装/选择 **creative-agent** profile
2. 按 creative-agent 文档配置 MCP、Vision、Skills
3. 成片输出路径与 social-agent 的 `$HERMES_ROOT/视频/` 对齐，便于 Step 5 发布

本 profile **不**内置 creative-agent MCP 配置，避免重复维护。
