---
name: creative-agent
description: |
  高质量创意视频路由 — 趋势短片、产品 URL 成片、MCP 创意能力。
  用户要「创意视频」「商业短片」时激活；与 Remotion 教程二选一时选本技能。
  教程/操作演示请用 create/remotion + tutorial-beat-video。对用户一律简体中文。
version: 1.1.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [video, creative, routing]
    related_skills:
      - create/remotion
      - create/pipeline-orchestrator
---

# 创意视频（creative-agent 路由）

本 profile **不内置** creative-agent MCP；成片在独立 profile 完成。

## When to use

- 趋势短片、产品 URL 一键成片
- 需要 Vision / MCP 创意编排
- Remotion 教程结构不适用的商业创意片

用户「做视频」时须先与 Remotion **二选一**；未选不准开工。

## When not to use

- 网站/软件操作教程、how-to、配置演示 → **`remotion`**
- 黑底花字口播（已弃用） → 不使用；改用本技能或 `remotion`
- 只发布已有视频不成片 → 对应平台 `{code}-publish`

## 操作步骤

1. 在 VidAU 中切换到 **[creative-agent](https://github.com/vidaudeveloper/creative-agent)** profile
2. 按上游 `docs/SETUP.md` 配置 MCP（可选：`https://creative.vidau.info/mcp`）
3. 成片输出对齐 `$HERMES_ROOT/视频/`，便于回到 social-agent 做 Step 5 发布

## 与 social-agent 管线

- social-agent 负责：选题 → 写稿 → 审核 → 发布路径清单
- creative-agent 负责：创意成片
- 回到 social-agent 后执行 `publish/*` 或 computer-use 发布

详见 `workspace/references/creative-agent-routing.md`（相对仓库根）。
