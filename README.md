# social-agent — 社媒运营老兵 Agent

> **一条指令**：选题研判 → 适配矩阵 → 写稿润色 → 配图 → 多平台发布

8 年社媒运营老兵 Agent。深谙知乎/公众号/小红书/抖音与 YouTube/TikTok 等平台规则。

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
| YouTube / TikTok | `npm run overseas:install` |
| X | `npm run x:setup` |
| Reddit | `npm run reddit:setup` |
| LinkedIn | `npm run linkedin:setup` |
| 知乎 | `uv tool install pyzhihu-cli` |

登录步骤见 `workspace/references/platform-login-quickstart.md`。

### 高质量视频

趋势短片、产品成片等请使用 [creative-agent](https://github.com/vidaudeveloper/creative-agent) profile。

### 内容归档目录

文稿、图片、视频默认写入 `$HERMES_ROOT`（未设置时默认为 profile 下的 `./content`）。

### 参考文档

| 文档 | 用途 |
|------|------|
| `workspace/references/platform-status.md` | 平台验证状态（唯一维护源） |
| `workspace/references/dependency-policy.md` | 按需安装与 Agent 约束 |
| `workspace/references/platform-login-quickstart.md` | 各平台登录操作速查 |
| `workspace/references/publish-confirm-paths.md` | 发布前确认绝对路径规范 |
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
