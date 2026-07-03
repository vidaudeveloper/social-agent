# social-agent — 社媒运营老兵 Agent

> **一条指令**：选题研判 → 适配矩阵 → 写稿润色 → 配图 → 多平台发布

8 年社媒运营老兵 Agent。深谙知乎/公众号/小红书/抖音与 YouTube/TikTok 等平台规则。

## 安装

```bash
hermes profile install github.com/你的用户名/social-agent-distribution --alias
```

安装后：
- 复制 `.env.EXAMPLE` 为 `.env`，填写 `TOKENWARE_API_KEY`
- 海外平台（YouTube/TikTok）先执行 `npm run overseas:install`
- 运行 `social-agent chat` 开始使用

> **Agent 禁止修改** `config.yaml` 的 model 段；详见 `workspace/references/agent-config-guardrails.md`。

## 使用

```bash
# 跑一篇完整内容管线
social-agent chat -q "帮我跑一篇内容，话题：2026下半年TK小店选品趋势"

# 只做选题采集
social-agent chat -q "今天TK行业有什么热点"

# 只写稿发布，不做选题
social-agent chat -q "帮我把这篇文章润色配图，发到小红书和公众号"
```

## 平台支持

| 平台 | 方案 | 状态 |
|------|------|------|
| **知乎** | skills/zhihu (MD→HTML→pyzhihu API) | ✅ 链路就绪 |
| **小红书** | xiaohongshu (XHS Bridge + Chrome 扩展) | ✅ 链路就绪 |
| **抖音** | PVA (@panda-video-automation/pva) | ✅ 链路就绪 |
| **YouTube** | sau (social-auto-upload) | ✅ 链路就绪 |
| **公众号** | baoyu-post-to-wechat + 微信官方 API | ✅ 链路就绪 |
| **TikTok** | social-auto-upload tk_uploader | ✅ 链路就绪 |
| **LinkedIn** | linkedin-cli (官方 OAuth) | ⚠️ 默认只出稿 |
| **X (Twitter)** | baoyu-post-to-x (Chrome CDP) | ⚠️ 默认只出稿 |

## 前置依赖

### 海外平台（YouTube / TikTok）

在 profile 根目录：

```powershell
npm run overseas:install          # 安装 social-auto-upload + playwright
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run tiktok:login              # TikTok 登录
```

`SAU_ROOT` 默认 `D:\test\tool\social-auto-upload`，可通过环境变量覆盖。

### 其他工具

该 Agent 部分能力依赖外部工具（PVA、Auto-Redbook 等），完整一键安装见原仓库：

```bash
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill
npm run setup:win   # Windows 一键安装 npm + Python + 第三方工具
```

## 目录结构

```
social-agent/
├── distribution.yaml              # 分发清单
├── package.json                   # overseas:install / tiktok:login
├── scripts/
│   ├── install-overseas-tools.ps1 # sau + playwright 安装
│   ├── run-tiktok.mjs             # TikTok CLI（uv 环境包装）
│   └── lib/                       # sau / overseas-guard 工具库
├── SOUL.md                        # Agent 身份 + 行为准则 + 管线规则
├── config.yaml                    # 模型/Provider/工具配置（Agent 禁止改 model 段）
├── .env.EXAMPLE                   # 环境变量模板
├── skills/social-media/
│   ├── xiaohongshu/               # 小红书发布技能
│   ├── youtube/                   # YouTube 发布技能
│   ├── douyin/                    # 抖音发布技能
│   ├── tiktok/                    # TikTok 发布技能
│   ├── zhihu/                     # 知乎发布技能
│   ├── x/                         # X (Twitter) 技能
│   ├── linkedin/                  # LinkedIn 技能
│   ├── image/                     # 配图技能
│   ├── reddit/                    # Reddit 技能
│   └── pipeline-orchestrator/     # 管线编排器（全流程指引）
├── workspace/
│   ├── references/                # 配置保护 + 海外合规 + tokenware 文档
│   └── templates/                 # 用户画像模板
└── user-profile.template.md       # 用户画像示例（安装后复制到 workspace/）
```

## License

MIT
