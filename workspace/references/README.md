# workspace/references 索引

> Agent **不要**默认读取本目录全部文件。先读 [`skill-routing.md`](skill-routing.md) 识别意图，再按意图与叶子 Skill 条件加载。

## 分类

| 类型 | 文件 | 何时读 | 唯一事实源 | 改动时同步 |
|------|------|--------|------------|------------|
| **强制契约** | [`skill-routing.md`](skill-routing.md) | 每次平台相关请求 | 是（路由） | 改意图/映射 → 同步 `tests/skill-routing/cases.yaml` |
| **强制契约** | [`platform-status.md`](platform-status.md) | 发布前、矩阵判断 | 是（平台状态） | 勿在 README/SOUL 复制表格 |
| **强制契约** | [`dependency-policy.md`](dependency-policy.md) | 缺依赖、安装前 | 是（依赖策略） | 增删 CLI/MCP → 同步 `deps:check` |
| **强制契约** | [`publish-confirm-paths.md`](publish-confirm-paths.md) | 发布前确认 | 是 | 改路径规范 → 同步 publish 叶子 |
| **强制契约** | [`agent-config-guardrails.md`](agent-config-guardrails.md) | 模型/API 异常 | 是 | — |
| **Skill 手册** | [`youtube-explore-setup.md`](youtube-explore-setup.md) | `yt-viral-*` 执行前 | TubePilot 配置 | 改 MCP 配置只改此文件 |
| **Skill 手册** | [`xiaohongshu-research.md`](xiaohongshu-research.md) | `xhs-research` | 知识库路径 | — |
| **Skill 手册** | [`platform-login-quickstart.md`](platform-login-quickstart.md) | 登录/鉴权任务 | 登录步骤 | 链接 `platform-status` |
| **Skill 手册** | [`topic-research-diversity.md`](topic-research-diversity.md) | `content-pipeline` Step 1 | 选题规则 | — |
| **Skill 手册** | [`creative-agent-routing.md`](creative-agent-routing.md) | `creative-agent` 叶子 | 视频切换 | 与 `skills/create/video/README.md` 一致 |
| **Skill 手册** | [`tokenware-*.md`](tokenware-models.md) | 生图/API 异常 | Tokenware | — |
| **Skill 手册** | [`overseas-automation-rules.md`](overseas-automation-rules.md) | 海外平台排障 | — | — |
| **Skill 手册** | [`playwright-install-runbook.md`](playwright-install-runbook.md) | Playwright 安装失败 | — | — |
| **路线图** | [`../../docs/social-agent-roadmap.md`](../../docs/social-agent-roadmap.md) | 能力缺口、规划查询 | 否 | 新功能立项时更新 |
| **故障记录** | [`../../docs/bugs.md`](../../docs/bugs.md) | 排障参考 | 否 | 修 bug 后追加 |

## 文档同步门禁

| 你改了… | 必须同步… |
|---------|-----------|
| 技能路由 / When 边界 | `skill-routing.md` + `cases.yaml` |
| 视频主线 | `skills/create/video/README.md` + `creative-agent-routing.md` |
| 平台可用性 | `platform-status.md` 仅此一处 |
| 依赖 / MCP | `dependency-policy.md` + 相关 setup 文档 |
| 用户画像路径 | `SOUL.md` + `pipeline-orchestrator` Step 0 |

## 不要做的事

- 不要把 bug 修复过程写进 reference（写 [`docs/bugs.md`](../../docs/bugs.md)）
- 不要在多个文件复制同一张平台状态表
- 不要假设「User Profile → Platform Status → 知识库 → …」适用于所有意图（见 `skill-routing.md` §上下文读取顺序）

## 变更版本

不单独维护 Spec；文档与代码变更通过 **Git 提交** 留痕。重大路由改动合并前跑 `npm run skill-routing:eval`。
