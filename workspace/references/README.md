# workspace/references — Agent 速查

接到平台相关请求时：**先读** [`skill-routing.md`](skill-routing.md)，再按意图加载叶子 Skill。不要默认打开本目录其它文件。

## 按任务读（Agent）

| 你在做什么 | 读这个 |
|------------|--------|
| 任何平台相关请求 | [`skill-routing.md`](skill-routing.md)（意图 + 上下文读取顺序） |
| 判断某平台能否自动发 | [`platform-status.md`](platform-status.md) |
| 缺依赖 / 安装提示 | [`dependency-policy.md`](dependency-policy.md) |
| 发布前给用户确认路径 | [`publish-confirm-paths.md`](publish-confirm-paths.md) |
| 模型 / API 异常 | [`agent-config-guardrails.md`](agent-config-guardrails.md) |
| YouTube 爆款调研 | [`youtube-explore-setup.md`](youtube-explore-setup.md)（`yt-viral-*` 要求） |
| 小红书调研落盘路径 | [`xiaohongshu-research.md`](xiaohongshu-research.md) |
| 登录步骤 | [`platform-login-quickstart.md`](platform-login-quickstart.md) |
| 选题多样化 | [`topic-research-diversity.md`](topic-research-diversity.md) |
| 视频切 Remotion / creative-agent | [`creative-agent-routing.md`](creative-agent-routing.md) |
| 能力缺口（未实现功能） | [`../../docs/social-agent-roadmap.md`](../../docs/social-agent-roadmap.md) |

## 硬规则（Agent）

1. 平台状态只认 `platform-status.md`，不要从别处抄表
2. 不同意图读取顺序不同：见 `skill-routing.md`「上下文读取顺序」——单平台发布不要默认读知识库或爬实时数据
3. TubePilot 等能力 MCP 仅在叶子 Skill 写明时使用；禁止用浏览器 MCP 替代 publish/login CLI

维护者改文档时的同步约定见 [`../../docs/maintainer-notes.md`](../../docs/maintainer-notes.md)。
