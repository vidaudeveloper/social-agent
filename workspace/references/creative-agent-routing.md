# creative-agent 视频路由

本 profile（social-agent）与 [creative-agent](https://github.com/vidaudeveloper/creative-agent) 分工如下。

视频类型总览：[`skills/create/video/README.md`](../skills/create/video/README.md)

## 三种成片方式

| 类型 | 技能 | 场景 |
|------|------|------|
| **TTS 口播** | `create/tts-narration` | 纯文字 + Edge TTS + ffmpeg（默认） |
| **Remotion** | `create/remotion` | React 动效、多场景、品牌模板 |
| **创意商业片** | `create/creative-agent` → creative-agent profile | 趋势片、产品 URL、MCP |

## 何时用 social-agent（本 profile）

- **TTS 口播**：`pipeline:douyin` / `pipeline:tiktok` / youtube `create-video`
- **Remotion**：在 `$HERMES_ROOT/视频/remotion/{slug}/` 建项目并渲染
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
