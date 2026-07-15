# 小红书分析报告落盘（xhs-research）

技能：`skills/explore/xiaohongshu/xhs-research/SKILL.md`  
命令：`npm run xhs:research -- <save-raw|save-details|save-insights|build|list>`

## 产出路径

`$HERMES_ROOT/知识库/xiaohongshu/{slug}/`

- `{slug}_竞品报告.html` — 给人看的完整报告
- `{slug}_创作参考.md` — **下次写稿优先读**
- `insights.json` / `details.json` / `raw.json`
- 全库指针：`知识库/xiaohongshu/LATEST.json`

`HERMES_ROOT` 默认仓库内 `content/`（已 gitignore）。

## 最小流程

1. `python skills/publish/xiaohongshu/scripts/cli.py search-feeds ...` → 临时 JSON  
2. `npm run xhs:research -- save-raw --topic <slug> --in ... --keyword ...`  
3. 多篇 `get-feed-detail`（防风控间隔）→ `save-details --append`  
4. `npm run xhs:research -- build --topic <slug>`

创作时：读 `LATEST.json` 或 `{slug}_创作参考.md`，7 天内同关键词默认不重爬。
