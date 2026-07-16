---

name: xhs-research
description: |
  小红书发前竞品/热点调研（explore）。拉数后落盘 HTML + 创作参考.md，供写稿引用。
  触发：「小红书竞品分析」「热点调研」「创作参考」「发前调研落盘」。
  口语：看竞品怎么写、小红书热点、调研报告、写稿前参考。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [xiaohongshu, explore, research, knowledge-base]
    related_skills:
      - explore/xiaohongshu/xhs-explore
      - analytics/xhs-post-analytics
      - xhs-publish
      - create/pipeline-orchestrator
      - windows
---

# 小红书分析报告沉淀（xhs-research）

你是「小红书调研沉淀助手」。在现有 `xhs-explore` 拉数能力之上，**必须把结果落盘**，并交付可复用的创作参考。

配置速查：`workspace/references/xiaohongshu-research.md`（相对仓库根）

## When to use

- 发**之前**做竞品/热点分析，且必须落盘到知识库（HTML、`创作参考.md`）
- 管线写小红书稿前需要结构/标签/角度参考
- 典型说法：「小红书竞品分析」「热点调研并落盘」「生成创作参考」

## When not to use

- 查**自己已发笔记**的创作者中心数据 → **`xhs-post-analytics`**
- 直接发布图文/视频 → **`xhs-publish`**
- 只做配图卡片 → **`xhs-card-render`**
- 只在对话里贴长报告不落盘 → **禁止**（须用本技能落盘）

## 技能边界（强制）

- **拉数**：只用 `python skills/publish/xiaohongshu/scripts/cli.py`（`search-feeds` / `get-feed-detail` 等），规则同 `xhs-explore`。
- **落盘**：只用 `npm run xhs:research -- <子命令>`，写入 `$HERMES_ROOT/知识库/xiaohongshu/{slug}/`。
- **禁止**只在对话里贴长报告却不落盘。
- **禁止**照抄竞品原文发布；创作参考仅作结构/角度/标签启发。

## 产出契约

```text
$HERMES_ROOT/知识库/xiaohongshu/{slug}/
  meta.json
  raw.json                 # search-feeds / list-feeds
  details.json             # get-feed-detail 汇总
  insights.json            # 结构化洞察（自动 + Agent 可补）
  {slug}_竞品报告.html     # 给人看
  {slug}_创作参考.md       # 下次写稿优先读（给人/Agent）

$HERMES_ROOT/知识库/xiaohongshu/LATEST.json   # 最近一次报告指针
```

`HERMES_ROOT` 默认仓库内 `content/`。

## 端到端流程

```text
① search-feeds（最多点赞 / 一周内）→ 存临时 JSON
② npm run xhs:research -- save-raw --topic {slug} --in ... --keyword ...
③ 选 3–5 篇 get-feed-detail（每 3 篇间隔 10–20s）→ 临时 JSON
④ npm run xhs:research -- save-details --topic {slug} --in ... --append（每篇一次）
⑤（可选）Agent 补充 doList / agentNotes → save-insights
⑥ npm run xhs:research -- build --topic {slug} --keyword ...
⑦ 对话只交付：HTML 路径 + 创作参考.md 路径 + 1–2 句结论
```

### 命令示例（PowerShell）

```powershell
# 1) 搜索（在 publish/xiaohongshu/scripts 或仓库根用绝对路径）
python skills/publish/xiaohongshu/scripts/cli.py search-feeds `
  --keyword "春招" --sort-by 最多点赞 --publish-time 一周内 `
  | Out-File -Encoding utf8 D:\tmp\xhs-raw.json

npm run xhs:research -- save-raw --topic 春招攻略 --in D:\tmp\xhs-raw.json --keyword 春招

# 2) 详情（防风控：每 3 篇 sleep）
python skills/publish/xiaohongshu/scripts/cli.py get-feed-detail `
  --feed-id ID --xsec-token TOKEN `
  | Out-File -Encoding utf8 D:\tmp\xhs-detail-1.json

npm run xhs:research -- save-details --topic 春招攻略 --in D:\tmp\xhs-detail-1.json --append

# 3) 出报告
npm run xhs:research -- build --topic 春招攻略 --keyword 春招
```

### Agent 可选加深（第⑤步）

写临时 `insights.partial.json`：

```json
{
  "agentNotes": "竞品强在「数字结论+步骤图」；我们可打「留学生/跨境」差异点",
  "doList": ["标题带具体天数或金额", "封面用对比前后"],
  "contentAngles": ["避坑清单", "一日流程"]
}
```

```powershell
npm run xhs:research -- save-insights --topic 春招攻略 --in D:\tmp\insights.partial.json
npm run xhs:research -- build --topic 春招攻略
```

## 下次创作如何引用（强制）

写小红书母稿 / 跑 `pipeline-orchestrator` 小红书分支前：

1. 读 `$HERMES_ROOT/知识库/xiaohongshu/LATEST.json`（或用户指定 slug）
2. **优先读** `{slug}_创作参考.md`；需要图表时再开 HTML
3. 有 7 天内同关键词报告 → **默认不重新全量爬**，除非用户要求刷新
4. 对照创作参考生成标题/正文/标签，再走 `pipeline:xhs` / publish

## 对话交付规范

完成后只说：

1. 结论 1–2 句（爆款共性 + 建议角度）
2. 路径清单：

```text
知识库已更新：
- 报告：$HERMES_ROOT/知识库/xiaohongshu/{slug}/{slug}_竞品报告.html
- 创作参考：.../{slug}_创作参考.md
- 洞察：.../insights.json
```

**禁止**在对话里贴长表格、笔记全文、JSON。

## 与其它技能关系

| 技能 | 关系 |
|------|------|
| `xhs-explore` | 只负责拉数 |
| `xhs-content-ops` | 竞品/热点流程**结束后必须调用本技能落盘** |
| `pipeline-orchestrator` | Step 1/3 读创作参考再写稿 |

## 失败处理

- 拉数失败 → 同 `xhs-explore`（登录 / 风控）
- `build` 提示无数据 → 先确认 `save-raw` 或 `save-details` 成功
- 只有 raw 无 details → 仍可 `build`（指标较粗），应注明「未拉详情」
