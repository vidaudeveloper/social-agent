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

## 技能命名规范（必读）

新增或改名 skill 时**必须**遵守本节。VidAU Hub 用路径**最后一段**作为安装目录名；末段撞名会导致 `Skill name collision` / `Unknown skill(s)`。

### 双层命名

| 层级 | 用途 | 规则 | 例子 |
|------|------|------|------|
| **中层目录** | 给人看、挂 `scripts/` | 可读全称或习惯名，本层内唯一 | `skills/publish/wechat`、`publish/youtube` |
| **叶子技能** | Agent / Hub 的 `name:` | `{平台码}-{能力}`，且 **目录名 = `name:`**，全局唯一 | `wechat-publish`、`yt-auth`、`dy-create` |

中层可以叫 `youtube`；叶子**禁止**再用裸平台词当地目录名（Hub 会丢掉中间路径）。

### 平台码

| 平台 | 码 |
|------|-----|
| 抖音 | `dy` |
| TikTok | `tt` |
| YouTube | `yt` |
| 小红书 | `xhs` |
| X | `x` |
| LinkedIn | `li` |
| 知乎 | `zh` |
| Reddit | `rd` |
| 微信公众号 | `wechat`（不用 `wx`） |

### 能力后缀

| 后缀 | 含义 |
|------|------|
| `-auth` | 登录 / 鉴权 |
| `-publish` | 发布 |
| `-create` | 成片/创作（多在 create 层） |
| `-interact` | 互动（可选） |
| `-upload` | 上传契约（可选） |
| `-analytics` / `-post-analytics` | 发后复盘（analytics 层） |
| `-skills` | 平台总览索引（**不进 Hub**） |
| explore 类 | `-explore` / `-research` / `-viral-*` 等，仍用平台码前缀 |

### publish 平台骨架

```text
skills/publish/{platform}/
  SKILL.md                 # name: {code}-skills（总览，不进 Hub）
  scripts/                 # 真正 CLI（语言不限）
  references/              # 可选
  skills/
    {code}-auth/SKILL.md
    {code}-publish/SKILL.md
```

实现可以不同；缺叶子时先补薄 `SKILL.md`（指向现有 `npm run`），不要先大搬脚本。

### Hub 规则

1. **叶子目录名 = `SKILL.md` 的 `name:`**
2. `paths` **只列叶子**，不要列父目录（如不要 `skills/create/video/tts-narration`，也不要中层 `skills/publish/youtube`）
3. **不要**把 `{code}-skills` 总览装进 Hub
4. 新增前全库搜同名目录 / 同名 `name:`

推荐 Hub 叶子示例：

```text
skills/create/video/tts-narration/dy-create
skills/create/video/tts-narration/tt-create
skills/create/video/tts-narration/yt-create
skills/analytics/xhs-post-analytics
skills/analytics/yt-post-analytics
skills/publish/wechat/skills/wechat-publish
skills/publish/douyin/skills/dy-publish
```

### 反例

| 错误 | 原因 |
|------|------|
| 叶子目录叫 `youtube` / `douyin` | Hub 末段与其它层撞车 |
| Hub 同时装 `tts-narration/youtube` 与 `analytics/youtube` | 都落到本机 `youtube/` |
| 只改 `name:` 不改目录名 | Hub 仍按目录末段安装 |
| 装父路径留下残影又不删 | 同名 `name:` 双份 → Ambiguous |

publish 落地表见 [`publish/README.md`](publish/README.md)。

## 平台状态与依赖

- 验证状态：[`workspace/references/platform-status.md`](../workspace/references/platform-status.md)
- 按需安装：[`workspace/references/dependency-policy.md`](../workspace/references/dependency-policy.md)
- 依赖检查：`npm run deps:check`

## 主编排入口

- [`create/pipeline-orchestrator/SKILL.md`](create/pipeline-orchestrator/SKILL.md)
