# Skills 五层索引

social-agent 的 skills 按**能力阶段**组织，不是每次都要跑完五层。

```text
explore → create → review → publish → analytics
```

## 意图路由（Agent 必读）

先读 [`../workspace/references/skill-routing.md`](../workspace/references/skill-routing.md)，再加载**最小必要叶子**：

| 用户要什么 | 意图 / 范围 | 入口 |
|------------|-------------|------|
| 明确一条龙到发布 | `full-workflow` | `pipeline-orchestrator` |
| 发前调研/选题/爆款 | `research` | `xhs-research` / `yt-viral-*` |
| 写稿/配图/成片（不默认发） | `create` | `xhs-card-render` / `remotion` 等 |
| 发布前审核 | `review` | `review` |
| 已有素材发布（可多平台） | `publish` | `{code}-publish` |
| 登录/鉴权 | `auth` | `{code}-auth` |
| 发后数据 | `analytics` | `*-post-analytics` / `li-analytics` |
| 评论互动 | `interact` | `xhs-interact` |
| 定时自动化 | `schedule(...)` | 当前 capability-gap |

五层目录与上述原子意图正交：目录管能力存放，意图管本次走哪条路。

Reference 速查：[`../workspace/references/README.md`](../workspace/references/README.md)  
路由回归：`npm run skill-routing:eval`  
路线图：[`../docs/social-agent-roadmap.md`](../docs/social-agent-roadmap.md)

## 五层职责

| 目录 | 职责 | 何时单独用 |
|------|------|------------|
| [explore/](explore/) | 发前调研 | 不自动 publish |
| [create/](create/) | 配图、视频、编排 | 只成片或完整管线 |
| [review/](review/) | 发布前格式/合规 | 审核或管线 Step 5 |
| [publish/](publish/) | 登录 + 发布 | 单平台直达叶子 |
| [analytics/](analytics/) | 发后复盘 | 只查数据 |

分流：小红书发前 → `xhs-research`；发后 → `xhs-post-analytics`。YouTube 同理（`yt-viral-*` vs `yt-post-analytics`）。

## 叶子模板

`description`：对象 + 产出 + 触发词。正文：

```markdown
## When to use
## When not to use
```

链接一律用相对路径（从本文件出发），勿写仓库根 `skills/...`。

## 技能前缀示例

| 层 | 示例 |
|----|------|
| explore | `explore/xiaohongshu`、`explore/youtube` |
| create | `create/pipeline-orchestrator`、`create/remotion` |
| review | `review` |
| publish | `publish/xiaohongshu`、`publish/youtube` |
| analytics | `analytics/xhs-post-analytics` |

## 命名与 Hub

新增 / 改名 skill → 读 [`../workspace/references/skill-naming.md`](../workspace/references/skill-naming.md)（维护者文档）。

## 平台状态

- [`../workspace/references/platform-status.md`](../workspace/references/platform-status.md)
- [`../workspace/references/dependency-policy.md`](../workspace/references/dependency-policy.md)

## 主编排

- [create/pipeline-orchestrator/SKILL.md](create/pipeline-orchestrator/SKILL.md)
