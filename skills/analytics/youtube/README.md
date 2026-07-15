# YouTube 数据分析

基于 [youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli)。

```powershell
npm run youtube:stats-setup
# 首次报表：配好 CLIENT_ID/SECRET 后浏览器授权
npm run youtube:oauth
# 拉数并落盘 HTML
npm run youtube:stats -- archive
```

产出：`$HERMES_ROOT/知识库/youtube/发布复盘/{channel}/{date}_作品复盘.html`

凭据与 OAuth：[`references/setup.md`](references/setup.md)  
Agent 技能：[`SKILL.md`](SKILL.md)
