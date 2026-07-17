# 维护者约定（非 Agent 运行时文档）

> 本文件给**开发者 / 贡献者**看。Agent 运行时请用 [`workspace/references/`](../workspace/references/README.md)。

## 文档同步门禁

| 改了… | 必须同步… |
|---------|-----------|
| 技能路由 / When 边界 | `skill-routing.md` + `tests/skill-routing/cases.yaml` |
| 视频主线 | `skills/create/video/README.md` + `creative-agent-routing.md` |
| 平台可用性 | **仅** `platform-status.md` |
| 依赖 / MCP | `dependency-policy.md` + 相关 setup |
| 用户画像路径 | `SOUL.md` + `pipeline-orchestrator` Step 0 |
| 技能命名 | [`skill-naming.md`](../workspace/references/skill-naming.md) |

## Skill 结构约定（对齐 skill-creator）

- 叶子 `SKILL.md`：`name` + `description`（含触发词）+ `When to use` / `When not to use` + 技能边界
- `SKILL.md` 尽量精简；长 CLI / 规格下沉到 `references/` 或叶子内一处
- 链接一律用**相对路径**（从当前文件出发），不要写仓库根式 `skills/...`（在 GitHub 上会断链）
- frontmatter 统一：`name` / `description` / `version` / `author` / `license` / `metadata.vidau.{tags,related_skills}`；不强制 `emoji` / `os` / `requires` / `source`

## 变更留痕

用 Git 提交与分支；修复记录写 [`bugs.md`](bugs.md)。不单独维护 Spec。

路由回归：`npm run skill-routing:eval`

## skill-creator

安装位置（本机，不进仓库）：`D:\test\tool\skills\skill-creator`  
上游：`https://github.com/anthropics/skills` 中的 `skills/skill-creator`  
写/改叶子 Skill 时对照其 Progressive Disclosure 与 description 触发规范；本仓库约定见上文「Skill 结构约定」。`.agents/` 已 gitignore，勿提交第三方 skill 副本。
