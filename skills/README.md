# Skills 五层索引

social-agent profile 的 skills 按**能力阶段**平铺在 `skills/` 下，不按平台堆叠。

```text
explore → create → review → publish → analytics
探索     创作      审核      发布      数据分析
```

## 意图路由（Agent 必读）

**不是每次请求都要跑完五层。** 先读 `[workspace/references/skill-routing.md](../workspace/references/skill-routing.md)`，识别四类意图后再加载**最小必要叶子 skill**：


| 用户要什么             | 意图                 | 典型入口                                |
| ----------------- | ------------------ | ----------------------------------- |
| 选题→写稿→多平台发布       | `content-pipeline` | `pipeline-orchestrator`             |
| 已有稿/媒体，只发一个平台     | `publish-single`   | `{code}-publish`                    |
| 查已发布作品/频道数据       | `analytics-post`   | `*-post-analytics` / `li-analytics` |
| 只做一步（登录/调研/配图/审核） | `focused-task`     | 对应叶子                                |


**单平台优先**：用户只提一个平台时，不要默认拉起完整编排器。

路由回归：`npm run skill-routing:eval` · 说明见 `[review/skill-routing-eval/SKILL.md](review/skill-routing-eval/SKILL.md)`

## 五层职责（按需组合）


| 目录                         | 中文   | 职责                  | 何时单独用                            |
| -------------------------- | ---- | ------------------- | -------------------------------- |
| `[explore/](explore/)`     | 探索   | 选题、调研、feed、竞品       | 发**前**调研；不自动进入 publish           |
| `[create/](create/)`       | 创作   | 配图、视频成片、主编排         | 只配图/只成片；完整生产才串联 explore→create→… |
| `[review/](review/)`       | 审核   | 发布前格式/合规            | 用户要审核，或 publish 前可选              |
| `[publish/](publish/)`     | 发布   | 各平台 login + publish | **单平台发布**直达 `{code}-publish`     |
| `[analytics/](analytics/)` | 数据分析 | 发**后**统计与复盘         | 只查数据；不进入 create/publish          |


跨层分流示例：

- 小红书发前竞品 → `explore` / `xhs-research`；发后自家数据 → `analytics` / `xhs-post-analytics`
- YouTube 发前爆款 → `yt-viral-discover` 或 `yt-viral-research`；发后频道 → `yt-post-analytics`

## 叶子 SKILL 描述模板（新增/改版必用）

frontmatter `description` 建议包含：**对象 + 产出 + 3–5 口语触发**。正文首段后补：

```markdown
## When to use
- …

## When not to use
- … → **`sibling-skill`**
```

执行边界仍写在「技能边界」；选型边界写在 When 两节。完整契约见 `skill-routing.md`。

## Hermes skill 前缀示例


| 层         | 前缀示例                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| explore   | `explore/xiaohongshu`、`explore/youtube`                                               |
| create    | `create/pipeline-orchestrator`、`create/tts-narration`、`create/remotion`               |
| review    | `review`                                                                              |
| publish   | `publish/xiaohongshu`、`publish/youtube`                                               |
| analytics | `analytics/li-analytics`、`analytics/xhs-post-analytics`、`analytics/yt-post-analytics` |


## 技能命名规范（必读）

新增或改名 skill 时**必须**遵守本节。VidAU Hub 用路径**最后一段**作为安装目录名；末段撞名会导致 `Skill name collision` / `Unknown skill(s)`。

### 双层命名


| 层级       | 用途                    | 规则                                    | 例子                                        |
| -------- | --------------------- | ------------------------------------- | ----------------------------------------- |
| **中层目录** | 给人看、挂 `scripts/`      | 可读全称或习惯名，本层内唯一                        | `skills/publish/wechat`、`publish/youtube` |
| **叶子技能** | Agent / Hub 的 `name:` | `{平台码}-{能力}`，且 **目录名 = `name:`**，全局唯一 | `wechat-publish`、`yt-auth`、`dy-create`    |


中层可以叫 `youtube`；叶子**禁止**再用裸平台词当地目录名（Hub 会丢掉中间路径）。

### 平台码


| 平台       | 码                 |
| -------- | ----------------- |
| 抖音       | `dy`              |
| TikTok   | `tt`              |
| YouTube  | `yt`              |
| 小红书      | `xhs`             |
| X        | `x`               |
| LinkedIn | `li`              |
| 知乎       | `zh`              |
| Reddit   | `rd`              |
| 微信公众号    | `wechat`（不用 `wx`） |


### 能力后缀


| 后缀                               | 含义                                              |
| -------------------------------- | ----------------------------------------------- |
| `-auth`                          | 登录 / 鉴权                                         |
| `-publish`                       | 发布                                              |
| `-create`                        | 成片/创作（多在 create 层）                              |
| `-interact`                      | 互动（可选）                                          |
| `-upload`                        | 上传契约（可选）                                        |
| `-analytics` / `-post-analytics` | 发后复盘（analytics 层）                               |
| `-skills`                        | 平台总览索引（**不进 Hub**）                              |
| explore 类                        | `-explore` / `-research` / `-viral-`* 等，仍用平台码前缀 |


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

### explore / create / analytics 骨架

```text
skills/explore/{platform}/          # 中层可读名，如 xiaohongshu、youtube
  {code}-explore/SKILL.md
  {code}-research/SKILL.md
  …

skills/create/image/                # 中层
  SKILL.md                          # name: img-skills（总览，不进 Hub）
  skills/
    xhs-card-render/SKILL.md
    img-tokenware/SKILL.md

skills/create/video/tts-narration/
  {code}-create/SKILL.md            # dy-create / tt-create / yt-create

skills/analytics/
  li-analytics/SKILL.md
  xhs-post-analytics/SKILL.md
  yt-post-analytics/SKILL.md
```

### 非平台技能例外

下列**不是**「平台码-能力」，可用产品/工具名（仍须全局唯一，且目录名 = `name:`）：


| name                          | 说明               |
| ----------------------------- | ---------------- |
| `pipeline-orchestrator`       | 主编排              |
| `remotion` / `creative-agent` | 视频工具链            |
| `tts-narration`               | 口播总览（已弃用，不进 Hub） |
| `review`                      | 发布前审核            |
| `img-skills`                  | 配图总览（不进 Hub）     |
| `img-tokenware`               | Tokenware 生图叶子   |


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
skills/create/image/skills/img-tokenware
skills/analytics/li-analytics
skills/analytics/xhs-post-analytics
skills/analytics/yt-post-analytics
skills/publish/wechat/skills/wechat-publish
skills/publish/douyin/skills/dy-publish
```

### 反例


| 错误                                                    | 原因                        |
| ----------------------------------------------------- | ------------------------- |
| 叶子目录叫 `youtube` / `douyin`                            | Hub 末段与其它层撞车              |
| Hub 同时装 `tts-narration/youtube` 与 `analytics/youtube` | 都落到本机 `youtube/`          |
| 只改 `name:` 不改目录名                                      | Hub 仍按目录末段安装              |
| 装父路径留下残影又不删                                           | 同名 `name:` 双份 → Ambiguous |


publish 落地表见 `[publish/README.md](publish/README.md)`。  
analytics 见 `[analytics/README.md](analytics/README.md)`；create 见 `[create/README.md](create/README.md)`；explore 见 `[explore/README.md](explore/README.md)`。

## 平台状态与依赖

- 验证状态：`[workspace/references/platform-status.md](../workspace/references/platform-status.md)`
- 按需安装：`[workspace/references/dependency-policy.md](../workspace/references/dependency-policy.md)`
- 依赖检查：`npm run deps:check`

## 主编排入口

- `[create/pipeline-orchestrator/SKILL.md](create/pipeline-orchestrator/SKILL.md)`

