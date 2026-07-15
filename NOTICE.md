# Third-Party Notices

本仓库（[vidaudeveloper/social-agent](https://github.com/vidaudeveloper/social-agent)）在 VidAU 自有编排与配置之外，集成了以下开源组件。各组件保留其原始许可证与版权声明。

## 捆绑技能

| 组件 | 路径 | 上游来源 | 许可证 |
|------|------|----------|--------|
| 小红书自动化 | `skills/publish/xiaohongshu/` | [xpzouying/skills/xiaohongshu](https://github.com/xpzouying/skills/xiaohongshu) | MIT |
| Reddit | `skills/publish/reddit/` | [1146345502/reddit-skills](https://github.com/1146345502/reddit-skills) | 见上游仓库 |
| X (Twitter) | `skills/publish/x/` | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-post-to-x) | 见上游仓库 |
| Remotion Agent Skills | `skills/create/video/remotion/rules/` | [remotion-dev/skills](https://github.com/remotion-dev/skills) | 见上游仓库 |

## 外部依赖（按需安装）

| 组件 | 用途 | 上游来源 |
|------|------|----------|
| Auto-Redbook-Skills | 小红书 MD→卡片 PNG | [comeonzhj/Auto-Redbook-Skills](https://github.com/comeonzhj/Auto-Redbook-Skills) |
| social-auto-upload | YouTube / TikTok / **抖音** 上传 | [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload) |
| gxbvc/linkedin-cli | LinkedIn OAuth 发帖 | [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli) |
| reddit-skills | Reddit 扩展桥 | [1146345502/reddit-skills](https://github.com/1146345502/reddit-skills) |
| pyzhihu-cli | 知乎发布 | 见 `skills/publish/zhihu/` |
| tubepilot (npm MCP) | YouTube explore 爆款发现 | [ixex/tubepilot](https://github.com/ixex/tubepilot) |
| youtube-transcript-api | YouTube explore 字幕抽取 | [jdepoix/youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) |
| youtube-analytics-cli | YouTube 频道/作品 Analytics | [Bin-Huang/youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli) |

## VidAU 自有部分

除上述第三方组件外，`SOUL.md`、`config.yaml`、`skills/create/pipeline-orchestrator`、`skills/review`、`workspace/` 及编排脚本为 VidAU 维护，适用根目录 [LICENSE](./LICENSE)（Copyright VidAU）。
