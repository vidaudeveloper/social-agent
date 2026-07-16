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
| analytics | `analytics/linkedin`、`analytics/xhs-post-analytics`、`analytics/yt-post-analytics` |

## 目录命名约定（VidAU Hub 必遵）

Hub 用路径**最后一段**作为安装目录名。为避免 `Skill name collision` / `Unknown skill(s)`：

1. **叶子目录名 = `SKILL.md` 的 `name:`**（全局唯一），例如 `dy-create/`、`yt-post-analytics/`
2. **禁止**用平台通用词当地目录：`douyin`、`tiktok`、`youtube`、`xiaohongshu`（会与其它层撞末段）
3. Hub `paths` **只列叶子**，不要列父目录（如不要 `skills/create/video/tts-narration`）
4. 新增技能前：全库搜一遍同名目录 / 同名 `name:`

推荐 Hub 叶子路径示例：

```text
skills/create/video/tts-narration/dy-create
skills/create/video/tts-narration/tt-create
skills/create/video/tts-narration/yt-create
skills/analytics/xhs-post-analytics
skills/analytics/yt-post-analytics
```

## 平台状态与依赖

- 验证状态：[`workspace/references/platform-status.md`](../workspace/references/platform-status.md)
- 按需安装：[`workspace/references/dependency-policy.md`](../workspace/references/dependency-policy.md)
- 依赖检查：`npm run deps:check`

## 主编排入口

- [`create/pipeline-orchestrator/SKILL.md`](create/pipeline-orchestrator/SKILL.md)
