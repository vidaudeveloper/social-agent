# social-agent

> 一位社媒运营专家 —— 帮你完成从选题研判、写稿配图、多平台发布到数据复盘的全流程。



---

## 📖 目录

- [为什么做](#-为什么做)
- [功能特性](#-功能特性)
- [平台能力](#-平台能力)
- [技术栈](#-技术栈)
- [目录结构](#-目录结构)
- [快速开始](#-快速开始)
- [Agent 参考索引](#-agent-参考索引)
- [第三方组件](#-第三方组件)
- [许可证](#-许可证)
- [联系方式](#-联系方式)

---

## 💡 为什么做

社媒运营工作繁杂、跨平台重复劳动多。social-agent 把这套经验沉淀为一位可对话的「社媒专家」：既能按意图单点调用（只写稿、只发某个平台、只查数据），也能自动串联成发布流水线，让一个人也能稳定经营多个账号。

---

## ✨ 功能特性

- **意图路由**：自动识别你要的是「流水线 / 单平台发布 / 发后分析 / 单点任务」，加载对应能力。
- **全链路覆盖**：选题研判 → 写稿润色 → 配图 → 发布前审核 → 多平台发布 → 数据复盘。
- **发布前审核**：结合平台规则自动校验合规与格式，降低违规风险。
- **视频成片**：基于 Remotion / creative-agent 生产视频内容（TTS 口播已弃用）。

---

## 🌐 平台能力


| 平台          | 能力                          |
| ----------- | --------------------------- |
| 小红书         | 选题调研、卡片配图、发布、笔记数据           |
| 知乎          | 内容转换、发布                     |
| 公众号         | 文章发布                        |
| 抖音          | 视频上传、视频生产                   |
| YouTube     | 爆款挖掘、视频上传、频道 / 作品 Analytics |
| TikTok      | 视频上传、视频生产                   |
| X (Twitter) | 推文发布                        |
| Reddit      | 发帖、社区运营                     |
| LinkedIn    | 动态发布                        |


> 各平台自动发布能力与登录方式以 [platform-status.md](workspace/references/platform-status.md) 为准。

---

## 🛠 技术栈

- **运行时**：VidAU / Hermes（要求 Hermes ≥ 0.12.0），由 `SOUL.md` + `config.yaml` + `skills/` 构成专家本体。
- **脚本**：Node.js（ESM）、PowerShell 安装脚本，部分 Python CLI（基于 `uv`）。
- **按需工具**：各平台 upload CLI、小红书卡片管线等，首次用到时按提示安装（详见[依赖策略](workspace/references/dependency-policy.md)）。

---

## 📂 目录结构

```text
social-agent/
├── SOUL.md / config.yaml / distribution.yaml
├── package.json
├── scripts/                 # 安装与编排脚本
├── skills/                  # explore · create · review · publish · analytics
├── workspace/
│   ├── references/          # 专家运行时速查（非开发备忘）
│   └── templates/           # 模板文件
├── docs/                    # 路线图、Bug 记录、维护者约定
├── user-profile.template.md
├── NOTICE.md                # 第三方组件说明
└── LICENSE
```

---

## 🚀 快速开始

### 环境要求

- **VidAU**（推荐使用环境）
- **Node.js ≥ 18**：运行脚本与视频生产
- **可选**：`uv`、`ffmpeg`（配图与视频相关任务）

### 安装与配置

1. 在 **VidAU** 中安装 social-agent 专家（来源：`github.com/vidaudeveloper/social-agent`）
2. 复制 `.env.EXAMPLE` 为 `.env`，并填写 `TOKENWARE_API_KEY`（**请勿提交 `.env`**）
3. 在 VidAU 中选择 **social-agent** 开始对话

平台工具**按需安装**：首次用到某平台的发布 / 配图时，按提示执行对应命令：


| 能力                    | 命令                            |
| --------------------- | ----------------------------- |
| 小红书卡片                 | `npm run tool:install`        |
| YouTube / TikTok / 抖音 | `npm run overseas:install`    |
| X                     | `npm run x:setup`             |
| Reddit                | `npm run reddit:setup`        |
| LinkedIn              | `npm run linkedin:setup`      |
| 知乎                    | `uv tool install pyzhihu-cli` |


依赖与安装策略详见 [dependency-policy.md](workspace/references/dependency-policy.md)；登录步骤见 [platform-login-quickstart.md](workspace/references/platform-login-quickstart.md)。

### 对话即用

在 VidAU 中直接用自然语言驱动，例如：

```text
帮我跑一篇内容，话题：2026 下半年 TikTok 小店选品趋势
```

```text
只发这篇到小红书：D:/content/文章/小红书/xxx.md
```

```text
查一下我小红书这篇笔记的数据
```

---

## 🤖 Agent 参考索引

> 以下为专家处理请求时的内部参考总览：接到平台相关请求时，先读取 [skill-routing.md](workspace/references/skill-routing.md) 识别意图，再加载对应的叶子 Skill。


| 场景              | 参考文档                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| 意图识别 + 读取顺序     | [skill-routing.md](workspace/references/skill-routing.md)                 |
| 平台是否支持自动发布      | [platform-status.md](workspace/references/platform-status.md)             |
| 缺少依赖            | [dependency-policy.md](workspace/references/dependency-policy.md)         |
| 发布前确认路径         | [publish-confirm-paths.md](workspace/references/publish-confirm-paths.md) |
| 全部 Reference 索引 | [workspace/references/README.md](workspace/references/README.md)          |
| Skills 五层索引     | [skills/README.md](skills/README.md)                                      |


---

## 📋 第三方组件

本专家集成了若干开源组件，均保留其原始许可证与版权声明，完整清单见 [NOTICE.md](./NOTICE.md)。

---

## 📄 许可证

基于 [MIT 许可证](./LICENSE) 发布。第三方组件遵循各自上游许可证，详见 [NOTICE.md](./NOTICE.md)。

---

## 📮 联系方式

- **仓库**：[vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)
- **维护者**：VidAU

