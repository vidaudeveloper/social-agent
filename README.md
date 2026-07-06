# social-agent — 社媒运营老兵 Agent

> **一条指令**：选题研判 → 适配矩阵 → 写稿润色 → 配图 → 多平台发布

8 年社媒运营老兵 Agent。深谙知乎/公众号/小红书/抖音与 YouTube/TikTok 等平台规则。

**仓库**：[github.com/vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)  
**作者**：VidAU

## 安装

### 通过 VidAU（推荐）

1. 在 VidAU 中安装本 profile（来源：`github.com/vidaudeveloper/social-agent`）
2. 复制 `.env.EXAMPLE` 为 `.env`，填写 `TOKENWARE_API_KEY`
3. 海外平台（YouTube/TikTok）在 profile 根目录执行 `npm run overseas:install`
4. Reddit 需执行 `npm run reddit:setup`（见 `skills/social-media/reddit/SKILL.md`）
5. 在 VidAU 中选择 **social-agent** profile 开始对话

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

## 平台支持

| 平台 | 方案 | 状态 |
|------|------|------|
| **知乎** | skills/zhihu (MD→HTML→pyzhihu API) | ✅ 链路就绪 |
| **小红书** | xiaohongshu (XHS Bridge + Chrome 扩展) | ✅ 链路就绪 |
| **抖音** | PVA (@panda-video-automation/pva) | ✅ 链路就绪 |
| **YouTube** | sau (social-auto-upload) | ✅ 链路就绪 |
| **公众号** | baoyu-post-to-wechat + 微信官方 API | ✅ 链路就绪 |
| **TikTok** | social-auto-upload tk_uploader | ⚠️ 发布稳定性待优化 |
| **Reddit** | reddit-skills (Chrome 扩展桥) | ✅ 须英文界面 |
| **LinkedIn** | linkedin-cli (官方 OAuth) | ⚠️ 默认只出稿 |
| **X (Twitter)** | baoyu-post-to-x (Chrome CDP) | ⚠️ 默认只出稿 |

## 前置依赖

### 海外平台（YouTube / TikTok）

```powershell
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION="true"
npm run tiktok:login
```

需事先 clone [social-auto-upload](https://github.com/dreammis/social-auto-upload)，通过 `SAU_ROOT` 指向其目录（默认 `./tool/social-auto-upload`）。

### 高质量视频

趋势短片、产品成片等请使用 [creative-agent](https://github.com/vidaudeveloper/creative-agent) profile。本 profile 仅保留 **纯文字+旁白**（Edge TTS + ffmpeg）出片，详见 `workspace/references/creative-agent-routing.md`。

### 内容归档目录

文稿、图片、视频默认写入 `$HERMES_ROOT`（未设置时默认为 profile 下的 `./content`）。

## 目录结构

```
social-agent/
├── distribution.yaml
├── package.json
├── SOUL.md
├── config.yaml
├── scripts/
├── skills/social-media/
├── workspace/references/
└── user-profile.template.md
```

## 第三方组件

详见 [NOTICE.md](./NOTICE.md)。

## License

[MIT](./LICENSE)
