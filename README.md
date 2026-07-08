# social-agent — 社媒运营老兵 Agent

> **一条指令**：选题研判 → 适配矩阵 → 写稿润色 → 配图 → 多平台发布

8 年社媒运营老兵 Agent。深谙知乎/公众号/小红书/抖音与 YouTube/TikTok 等平台规则。

**仓库**：[github.com/vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)  
**作者**：VidAU

## 安装

### 通过 VidAU（推荐）

1. 在 VidAU 中安装本 profile（来源：`github.com/vidaudeveloper/social-agent`）
2. 复制 `.env.EXAMPLE` 为 `.env`，填写 `TOKENWARE_API_KEY`
3. 小红书配图：`npm run tool:install`（Auto-Redbook 卡片渲染，见下方）
4. 海外平台（YouTube/TikTok）在 profile 根目录执行 `npm run overseas:install`
5. Reddit 需执行 `npm run reddit:setup`（见 `skills/social-media/reddit/SKILL.md`）
6. LinkedIn 需执行 `npm run linkedin:setup`（见 `skills/social-media/linkedin/SKILL.md`）
7. 在 VidAU 中选择 **social-agent** profile 开始对话

### 手动克隆（开发）

```bash
git clone https://github.com/vidaudeveloper/social-agent.git
cd social-agent
```

将克隆目录配置为 VidAU 的 profile 路径即可。

> **Agent 禁止修改** `config.yaml` 的 model 段；详见 `workspace/references/agent-config-guardrails.md`。

## 使用

在 VidAU 中与 social-agent profile 对话，例如：

```
帮我跑一篇内容，话题：2026下半年TK小店选品趋势
```

### 发布前审核（可单独使用）

不跑完整管线时，也可只审核成稿。审核员**参考标准**维护在 CSV，同步为 Markdown 后供 Agent 对照（非 lint 硬编码）：

```powershell
# 编辑 CSV 后同步手册 + rules 数值规则
npm run review:sync-specs

# 硬规则检查（数值来自同步后的 rules/*.yaml）
npm run review:lint -- --platform xiaohongshu --file "D:/content/文章/小红书/20260706_xxx.md"
```

参考手册：`skills/content-reviewer/references/platform-publish-standards.md`（由 CSV 自动生成）。详见 `skills/content-reviewer/SKILL.md`。

## 平台支持

> **已测试通过**（端到端发布验证）：知乎、小红书、Reddit、YouTube、TikTok。  
> 其余平台代码已接入，**尚未完成端到端测试**，默认只出稿或需用户明确确认后再尝试发布。

| 平台 | 方案 | 状态 |
|------|------|------|
| **知乎** | skills/zhihu (MD→HTML→pyzhihu API) | ✅ 已测试通过 |
| **小红书** | xiaohongshu (XHS Bridge + Chrome 扩展) | ✅ 已测试通过 |
| **YouTube** | sau (social-auto-upload) | ✅ 已测试通过 |
| **TikTok** | social-auto-upload tk_uploader | ✅ 已测试通过 |
| **Reddit** | reddit-skills (Chrome 扩展桥) | ✅ 已测试通过（界面须 English） |
| **抖音** | PVA (@panda-video-automation/pva) | ⏳ 未测试通过 |
| **公众号** | baoyu-post-to-wechat + 微信官方 API | ⏳ 未测试通过 |
| **LinkedIn** | gxbvc/linkedin-cli | ⏳ 未测试通过 |
| **X (Twitter)** | baoyu-post-to-x (Chrome CDP) | ✅ 登录+填稿已测试通过 |

## 前置依赖

### 小红书配图（xhs-card-render）

```powershell
npm run tool:install
npm run pipeline:xhs -- -Slug your-slug
```

自动 clone 到 `tool/Auto-Redbook-Skills`（可用 `AUTO_REDBOOK_ROOT` 覆盖）。  
登录与扩展见 `workspace/references/platform-login-quickstart.md`。

### 海外平台（YouTube / TikTok）

```powershell
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run tiktok:login
```

`npm run overseas:install` 会自动 clone 到 `tool/social-auto-upload`（可用 `SAU_ROOT` 覆盖）。

### LinkedIn

```powershell
npm run linkedin:setup
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run linkedin:login
```

上游 CLI 默认目录 `tool/linkedin-cli`（`LINKEDIN_CLI_ROOT` 可覆盖）。Redirect URL：`http://localhost:3457/callback`。

### X (Twitter)

```powershell
npm run x:setup
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run x:login          # 只开一次登录页，登录完 Enter，cookie 写入 profile
npm run x:check-login    # 验证 auth_token + ct0
npm run x:publish -- --text "测试文案"   # 默认仅填稿；Chrome 保持打开
```

**重要**：操作完成后**不要关闭 Chrome**（默认 `X_CLOSE_BROWSER=false`），复用同一会话，避免反复登录触发风控。Cookie 保存在 `%APPDATA%\baoyu-skills\chrome-profile`。

### 高质量视频

趋势短片、产品成片等请使用 [creative-agent](https://github.com/vidaudeveloper/creative-agent) profile。本 profile 仅保留 **纯文字+旁白**（Edge TTS + ffmpeg）出片，详见 `workspace/references/creative-agent-routing.md`。

### 内容归档目录

文稿、图片、视频默认写入 `$HERMES_ROOT`（未设置时默认为 profile 下的 `./content`）。

### 参考文档

| 文档 | 用途 |
|------|------|
| `workspace/references/platform-login-quickstart.md` | 各平台登录操作速查 |
| `workspace/references/publish-confirm-paths.md` | 发布前确认绝对路径规范 |
| `workspace/references/topic-research-diversity.md` | 选题搜索去重与多样化 |

## 目录结构

```
social-agent/
├── distribution.yaml
├── package.json
├── SOUL.md
├── config.yaml
├── scripts/
├── skills/
│   ├── social-media/       # 各平台发布、配图、管线编排
│   └── content-reviewer/   # 发布前审核（独立可调用）
├── workspace/references/
└── user-profile.template.md
```

## 第三方组件

详见 [NOTICE.md](./NOTICE.md)。

## License

[MIT](./LICENSE)
