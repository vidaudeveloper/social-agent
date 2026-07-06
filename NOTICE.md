# Third-Party Notices

本仓库（[vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)）在 VidAU 自有编排与配置之外，集成了以下开源组件。各组件保留其原始许可证与版权声明。

## 捆绑技能

| 组件 | 路径 | 上游来源 | 许可证 |
|------|------|----------|--------|
| 小红书自动化 | `skills/social-media/xiaohongshu/` | [xpzouying/skills/xiaohongshu](https://github.com/xpzouying/skills/xiaohongshu) | MIT（见该目录 `LICENSE`，Copyright Auto-Claw-CC） |
| Reddit | `skills/social-media/reddit/` | [1146345502/reddit-skills](https://github.com/1146345502/reddit-skills) | 见上游仓库 |
| X (Twitter) | `skills/social-media/x/` | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-post-to-x) | 见上游仓库 |
| 小红书卡片渲染 | `skills/social-media/image/skills/xhs-card-render/` | [comeonzhj/Auto-Redbook-Skills](https://github.com/comeonzhj/Auto-Redbook-Skills) | 见上游仓库 |

## 外部依赖（需单独安装）

| 组件 | 用途 | 上游来源 |
|------|------|----------|
| Auto-Redbook-Skills | 小红书 MD→卡片 PNG（`npm run tool:install`） | [comeonzhj/Auto-Redbook-Skills](https://github.com/comeonzhj/Auto-Redbook-Skills) |
| social-auto-upload | YouTube / TikTok 上传 | [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload) |
| gxbvc/linkedin-cli | LinkedIn OAuth 发帖与基础互动数据 | [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli) |
| reddit-skills | Reddit 扩展桥 + CLI | [1146345502/reddit-skills](https://github.com/1146345502/reddit-skills) |
| PVA | 抖音视频自动化 | [@panda-video-automation/pva](https://www.npmjs.com/package/@panda-video-automation/pva) |
| pyzhihu-cli | 知乎发布 | 见 `skills/social-media/zhihu/` 文档 |

## VidAU 自有部分

除上述第三方组件外，`SOUL.md`、`config.yaml`、`pipeline-orchestrator`、`content-reviewer`、`workspace/` 及本仓库编排脚本为 VidAU 维护，适用根目录 [LICENSE](./LICENSE)（Copyright VidAU）。

如有遗漏或归属有误，请通过 GitHub Issues 反馈。
