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
| [`create/video/`](create/video/) | 创作 | TTS 口播 / Remotion / creative-agent 路由 |
| [`review/`](review/) | 审核 | 发布前格式/合规检查（`review:lint`） |
| [`publish/`](publish/) | 发布 | 各平台 login + publish CLI |
| [`analytics/`](analytics/) | 数据分析 | 发布后统计与复盘 |

## Hermes skill 前缀示例

| 层 | 前缀示例 |
|----|----------|
| explore | `explore/xiaohongshu`、`explore/youtube` |
| create | `create/pipeline-orchestrator`、`create/tts-narration`、`create/remotion` |
| review | `review` |
| publish | `publish/xiaohongshu`、`publish/youtube` |
| analytics | `analytics/linkedin`、`analytics/xiaohongshu`、`analytics/youtube` |

## 平台状态与依赖

- 验证状态：[`workspace/references/platform-status.md`](../workspace/references/platform-status.md)
- 按需安装：[`workspace/references/dependency-policy.md`](../workspace/references/dependency-policy.md)
- 依赖检查：`npm run deps:check`

## 主编排入口

- [`create/pipeline-orchestrator/SKILL.md`](create/pipeline-orchestrator/SKILL.md)
