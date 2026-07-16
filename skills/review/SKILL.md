---
name: review
description: |
  发布前内容审核（focused-task / 管线 Step 4.5）。对照平台发布标准做格式/合规软审核。
  触发：「审核这篇稿」「发布前检查」「content review」「过一遍格式」。
  口语：审核文稿、发布前检查、格式合规、小红书稿检查。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  hermes:
    tags: [review, content-review, quality-gate, pre-publish]
    related_skills:
      - pipeline-orchestrator
      - skill-routing-eval
---

# gaiyi发布前内容审核（review）

**触发条件**：「审核」「发布前检查」「content review」「帮我过一遍格式」「检查这篇小红书稿」  
**不要用于**：登录态检查（→ `{code}-auth`）/ 配图生成（→ `xhs-card-render` / `img-tokenware`）/ 实际发布（→ `{code}-publish`）/ 选题研判（→ explore / `pipeline-orchestrator`）

本技能**自包含**：不依赖 humanizer、配图或 publish CLI。输入仅为平台 + 文稿路径（+ 可选配图/视频/母稿）。

## 审核参考标准（主）

**各平台发布规格以参考手册为准，你只维护 CSV，不要手改生成的 Markdown。**


| 角色        | 路径                                                                                     |
| --------- | -------------------------------------------------------------------------------------- |
| **唯一维护源** | `[specs/platform-publish-standards.csv](specs/platform-publish-standards.csv)`         |
| **审核员阅读** | `[references/platform-publish-standards.md](references/platform-publish-standards.md)` |
| **数值硬规则** | `[rules/{platform}.yaml](rules/)`（由 CSV 自动生成，勿手改）                                      |
| **同步命令**  | `npm run review:sync-specs`                                                            |


用户更新 CSV 后，执行 `npm run review:sync-specs`，会同时更新参考手册与 `rules/*.yaml` 中的数值上限。

手册涵盖：画面比例、时长、封面、合规等（软审核）。CSV 中可解析的数字（标题/正文字数、标签数量、图片张数等）会同步到 `rules/*.yaml`，供 `review:lint` 硬检。

### 平台 + 内容载体

CSV 按「平台 + 内容载体」多行组织（如 TikTok 短视频 / 图文、IG Feed / Reels）。

1. 向用户确认或使用入参 `content_type`（内容载体）
2. 在 `[platform-publish-standards.md](references/platform-publish-standards.md)` 中找到对应平台与小节
3. 用户未指定载体时，选用标注 **★（主推）** 的行

### 平台名称对照


| 用户说法           | 手册章节                 |
| -------------- | -------------------- |
| TikTok / 抖音海外  | TikTok（海外短视频）        |
| YouTube        | YouTube（长视频）         |
| Instagram / IG | Instagram（IG）        |
| Facebook / FB  | Facebook（FB）         |
| LinkedIn / 领英  | LinkedIn（领英 / B 端职场） |
| 小红书 / XHS      | 小红书（国内种草）            |
| 知乎             | 知乎（国内知识问答）           |


## 可选：lint 硬规则

CSV 中**可解析的数值上限**已同步至 `[rules/](rules/)`（`review:sync-specs` 自动生成）。另有少量固定格式规则（知乎 Markdown、小红书标签行等）。

```powershell
npm run review:lint -- --platform <platform> --file "<content_file>" [--carrier "短视频（主推）"] [--images ...]
```

格式说明见 `[references/rule-schema.md](references/rule-schema.md)`。**lint 不能替代参考手册的完整软审核。**

## 输入


| 参数                 | 必填       | 说明                        |
| ------------------ | -------- | ------------------------- |
| `platform`         | 是        | 平台（见上表）                   |
| `content_type`     | 否        | 内容载体，如「短视频（主推）」「图文笔记（主推）」 |
| `content_file`     | 是        | 文稿**绝对路径**                |
| `title`            | 否        | 未提供则从首行 `# 标题` 解析         |
| `images` / `video` | 否        | 配图/视频绝对路径，对照手册中的画面与封面标准   |
| `master_draft`     | 否        | bilingual 场景对比母稿          |
| `subreddit`        | Reddit 时 | 如 `TikTokshop`            |
| `slug`             | 否        | 报告文件名；默认从 content_file 推导 |


## 执行流程

1. 确认已执行 `npm run review:sync-specs`（手册 + `rules/*.yaml` 与 CSV 一致）
2. 按 **平台 + 内容载体** 定位手册中的对应小节
3. （可选）`npm run review:lint` 收集少量硬规则结果
4. **对照参考手册**逐项软审核：画面/时长/封面/文案/标签/字幕/合规，记录符合项与差距
5. 按 `[references/report-template.md](references/report-template.md)` 生成报告，写入：

`$HERMES_ROOT/审核/{日期}_{slug}.md`（未设置 `HERMES_ROOT` 时 `./content/审核/`）

1. **阻断策略（软审核）**：
  - 与手册严重不符且影响发布/限流 → 建议修复后再发，询问用户是否继续
  - 轻微差距 → 报告 + 优化建议
  - lint 存在 `error`（若已运行）→ 优先修复硬规则项

## 不做的事

- 不调用 humanizer、不跑配图、不检查 cookie/登录态、不执行 publish CLI
- 不把 CSV 内容硬编码进 lint；手册变更只通过 `review:sync-specs` 更新 Markdown

## 与管线的关系

`pipeline-orchestrator`（`skills/create/pipeline-orchestrator/`）在 Step 4 与 Step 5 之间可选调用本技能（Step 4.5）。管线内仅引用技能名，**不重复**手册条文。

## 常见陷阱

1. 审核前确认手册与 CSV 同步（`review:sync-specs`）
2. 同一平台多载体（如 IG Feed vs Reels）标准不同，必须先对齐载体
3. 知乎 / 小红书等另有 `rules/*.yaml` 格式硬规则，与手册软标准配合使用
4. Reddit 等未收录于 CSV 的平台，仍用 `rules/reddit.yaml` + lint

