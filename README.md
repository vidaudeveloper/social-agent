# social-agent — 社媒运营老兵 Agent

> **一条指令**：先识别意图 → 加载最小必要 skill → 选题/写稿/配图/发布/复盘（按需组合）

8 年社媒运营老兵 Agent。深谙知乎/公众号/小红书/抖音与 YouTube/TikTok 等平台规则。

**意图路由（Agent）**：[`workspace/references/skill-routing.md`](workspace/references/skill-routing.md) — 单平台发布、多平台流水线、发后分析、单点任务分流。  
**路由回归**：`npm run skill-routing:eval`（见 [`skills/review/skill-routing-eval/SKILL.md`](skills/review/skill-routing-eval/SKILL.md)）

**仓库**：[github.com/vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)  
**作者**：VidAU

## 安装

### 通过 VidAU（推荐）

1. 在 VidAU 中安装本 profile（来源：`github.com/vidaudeveloper/social-agent`）
2. 复制 `.env.EXAMPLE` 为 `.env`，填写 `TOKENWARE_API_KEY`
3. 在 VidAU 中选择 **social-agent** profile 开始对话

**平台工具按需安装**：首次使用某平台 publish/配图前，CLI 会提示对应 `npm run *:install`。详见 [`workspace/references/dependency-policy.md`](workspace/references/dependency-policy.md)。

### 手动克隆（开发）

```bash
git clone https://github.com/vidaudeveloper/social-agent.git
cd social-agent
```

将克隆目录配置为 VidAU 的 profile 路径即可。

> **新增 / 改名 skill**：必读 [`skills/README.md`](skills/README.md)「技能命名规范」（叶子 = `{平台码}-{能力}`，Hub 只装叶子）。publish 清单见 [`skills/publish/README.md`](skills/publish/README.md)。

> **Agent 禁止修改** `config.yaml` 的 model 段；详见 `workspace/references/agent-config-guardrails.md`。
## 使用

在 VidAU 中与 social-agent profile 对话，例如：

```
帮我跑一篇内容，话题：2026下半年TK小店选品趋势
```

### 发布前审核（可单独使用）

```powershell
npm run review:sync-specs
npm run review:lint -- --platform xiaohongshu --file "D:/content/文章/小红书/20260706_xxx.md"
```

详见 `skills/review/SKILL.md`。

## 平台支持

**唯一状态表**：[`workspace/references/platform-status.md`](workspace/references/platform-status.md)（三态：√ / × / ⚠️）

## 依赖检查

```powershell
npm run deps:check
npm run deps:check -- --platform xhs-card,youtube,x
```

## 按需安装速查

| 能力 | 命令 |
|------|------|
| 小红书卡片 | `npm run tool:install` |
| YouTube / TikTok / 抖音 | `npm run overseas:install` |
| X | `npm run x:setup` |
| Reddit | `npm run reddit:setup` |
| LinkedIn | `npm run linkedin:setup` |
| 知乎 | `uv tool install pyzhihu-cli` |

登录步骤见 `workspace/references/platform-login-quickstart.md`。

### 视频成片（三种类型）

详见 [`skills/create/video/README.md`](skills/create/video/README.md)。

| 类型 | 技能 | 说明 |
|------|------|------|
| Remotion | `create/remotion` | **默认推荐**；教程 / 动效 / 多场景 |
| 创意商业片 | `create/creative-agent` | 切换 [creative-agent](https://github.com/vidaudeveloper/creative-agent) profile |
| ~~TTS 口播~~ | `create/video/tts-narration` | **已弃用**；仅旧口播管线兼容 |

#### Remotion 使用说明

**适用**：培训片、产品宣传片、带转场/字幕动画/图表的竖版或横版视频。  
**不适用**：纯口播黑底花字（已弃用；见 `create/video/tts-narration`，新需求用 Remotion 或 creative-agent）。

**技能路径**：[`skills/create/video/remotion/SKILL.md`](skills/create/video/remotion/SKILL.md)（含 30+ 条 `rules/` 子规则，源自 [remotion-dev/skills](https://github.com/remotion-dev/skills)）。

**推荐流程**：

1. 在 `$HERMES_ROOT/视频/remotion/{slug}/` 建独立 Remotion 项目（脚手架：`npx create-video@latest --yes --blank --no-tailwind {slug}`）
2. 按参考文案分段旁白 → 在 **Remotion 项目目录内** 用 `edge-tts` / ElevenLabs 生成配音 → 输出 `voiceover-meta.json` / `captions.vtt`（勿在 profile `scripts/` 放写死文案的 demo 脚本）
3. 用 `Series` + `Sequence` 编写多场景 Composition；动画基于 `useCurrentFrame()` + `interpolate()`（禁用 CSS transition）
4. 预览：`npx remotion studio`；渲染：`npx remotion render [id] out/video.mp4`
5. 成片回到 `publish/*` 发布

**环境**：Node ≥ 18、`ffmpeg`、`uv run edge-tts`。Windows 渲染建议复制项目到 ASCII 路径（如 `D:\tmp\{slug}`）再 `npm install` + `npm run render`，避免中文路径导致 Headless Chrome 失败。

**检查技能完整性**：

```powershell
npm run remotion:check
```

**本地示例项目**（仅开发机保留，**不提交仓库**）：

| 目录 | 说明 |
|------|------|
| `content/视频/remotion/tiktok-ip-lycheeip/` | 产品宣传片（配音+字幕+官网截图） |
| `content/视频/remotion/tiktok-shop-training/` | 培训手册成片（10 场景，配音+字幕） |

各示例目录下有 `README.md`，含 `voiceover` / `render` 命令。渲染产物（`out/*.mp4`、配音缓存等）见 `.gitignore`，勿 push 到远程。

### 内容归档目录

文稿、图片、视频默认写入 `$HERMES_ROOT`（未设置时默认为 profile 下的 `./content`）。

> **`content/` 为本地工作区，含测试成片与素材，已加入 `.gitignore`，请勿提交到仓库。**

### 参考文档

| 文档 | 用途 |
|------|------|
| `workspace/references/platform-status.md` | 平台验证状态（唯一维护源） |
| `workspace/references/dependency-policy.md` | 按需安装与 Agent 约束 |
| `workspace/references/platform-login-quickstart.md` | 各平台登录操作速查 |
| `workspace/references/publish-confirm-paths.md` | 发布前确认绝对路径规范 |
| `workspace/references/skill-routing.md` | 意图路由与上下文读取顺序 |
| `workspace/references/README.md` | Reference 索引与同步门禁 |
| `docs/social-agent-roadmap.md` | 能力路线图与 capability gap |
| `skills/README.md` | Skills 五层索引 |

## 目录结构

```
social-agent/
├── distribution.yaml
├── package.json
├── SOUL.md
├── config.yaml
├── scripts/
├── skills/
│   ├── README.md           # explore / create / review / publish / analytics
│   ├── explore/
│   ├── create/
│   ├── review/             # 发布前审核（SKILL + rules + lint）
│   ├── publish/
│   └── analytics/
├── workspace/references/
└── user-profile.template.md
```

## 第三方组件

详见 [NOTICE.md](./NOTICE.md)。

## License

[MIT](./LICENSE)
