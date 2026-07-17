# creative-agent 视频路由

本 profile（social-agent）与 [creative-agent](https://github.com/vidaudeveloper/creative-agent) 分工如下。

**视频类型唯一索引**：[`skills/create/video/README.md`](../../skills/create/video/README.md)

## 三种成片方式

| 类型 | 技能 | 场景 |
|------|------|------|
| **Remotion** | `create/remotion` | 教程 / 操作演示 / 配置说明 / 程序化动效（**默认推荐**） |
| **创意商业片** | `create/creative-agent` → creative-agent profile | 趋势片、产品 URL、MCP/Vision 创意 |
| ~~TTS 口播~~ | `create/video/tts-narration` | **已弃用**；仅用户明确要求「旧口播管线」时兼容 |

## 何时用 social-agent（本 profile）

- **Remotion**：在 `$CONTENT_ROOT/视频/remotion/{slug}/` 建项目并渲染；教程须加载 `rules/tutorial-beat-video.md`
- **创意商业片路由**：加载 `create/creative-agent` 叶子，再切换 creative-agent profile 成片
- 社媒全文管线：选题 → 写稿 → 配图 → 多平台发布（见 `pipeline-orchestrator`）

## 何时切换到 creative-agent profile

- 趋势短片、产品 URL 成片、需要 MCP/Vision 创意编排时
- 仓库：https://github.com/vidaudeveloper/creative-agent
- MCP（可选）：`https://creative.vidau.info/mcp`（见 creative-agent 文档 `docs/SETUP.md`）

## 操作方式

1. 在 VidAU 中安装/选择 **creative-agent** profile
2. 按 creative-agent 文档配置 MCP、Vision、Skills
3. 成片输出路径与 social-agent 的 `$CONTENT_ROOT/视频/` 对齐，便于 Step 5 发布

本 profile **不**内置 creative-agent MCP 配置，避免重复维护。

## 不要用于

- 新教程 / how-to / 配置演示 → 用 **Remotion**，不要默认 TTS 黑底花字
- 只发布已有 MP4 → 对应平台 `{code}-publish`，不走本页
