---
name: creative-agent
description: |
  高质量创意视频路由 — 趋势短片、产品 URL 成片、MCP 创意能力。用户要「创意视频」「商业短片」「不用口播花字」时激活。
  实际渲染在 creative-agent profile 完成，本技能仅路由与路径约定。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [video, creative, routing]
    related_skills:
      - create/tts-narration
      - create/remotion
      - create/pipeline-orchestrator
---

# 创意视频（creative-agent 路由）

本 profile **不内置** creative-agent MCP；成片在独立 profile 完成。

## 何时切换

- 趋势短片、产品 URL 一键成片
- 需要 Vision / MCP 创意编排
- TTS 花字或 Remotion 无法满足质量要求

## 操作步骤

1. 在 VidAU 中切换到 **[creative-agent](https://github.com/vidaudeveloper/creative-agent)** profile
2. 按上游 `docs/SETUP.md` 配置 MCP（可选：`https://creative.vidau.info/mcp`）
3. 成片输出对齐 `$HERMES_ROOT/视频/`，便于回到 social-agent 做 Step 5 发布

## 与 social-agent 管线

- social-agent 负责：选题 → 写稿 → 审核 → 发布路径清单
- creative-agent 负责：创意成片
- 回到 social-agent 后执行 `publish/*` 或 computer-use 发布

详见 `workspace/references/creative-agent-routing.md`（相对仓库根）。
