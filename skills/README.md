# Skills 五层索引

social-agent profile 的 skills 按**能力阶段**平铺在 `skills/` 下，不按平台堆叠。

```text
explore → create → review → publish → analytics
探索     创作      审核      发布      数据分析
```

## 五层职责

| 目录 | 中文 | 职责 |
|------|------|------|
| [`explore/`](explore/) | 探索 | 选题、调研、feed、竞品 |
| [`create/`](create/) | 创作 | 写稿、配图、视频、管线编排 |
| [`review/`](review/) | 审核 | 发布前检查（见 content-reviewer） |
| [`publish/`](publish/) | 发布 | 各平台 login + publish CLI |
| [`analytics/`](analytics/) | 数据分析 | 发布后统计与复盘 |

## Hermes skill 前缀示例

| 层 | 前缀示例 |
|----|----------|
| explore | `explore/xiaohongshu` |
| create | `create/pipeline-orchestrator`、`create/xhs-card-render` |
| review | `content-reviewer`（平级，见 review/README） |
| publish | `publish/xiaohongshu`、`publish/youtube` |
| analytics | `analytics/linkedin` |

## 平台状态与依赖

- 验证状态：[`workspace/references/platform-status.md`](../workspace/references/platform-status.md)
- 按需安装：[`workspace/references/dependency-policy.md`](../workspace/references/dependency-policy.md)
- 依赖检查：`npm run deps:check`

## 主编排入口

- [`create/pipeline-orchestrator/SKILL.md`](create/pipeline-orchestrator/SKILL.md)
