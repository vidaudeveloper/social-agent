---
name: xhs-skills
description: |
  小红书自动化总览（不进 Hub）。索引认证、发布、搜索、互动、复合运营子技能。
  触发：仅作索引参考；实际操作请直接用对应子技能（`xhs-publish`/`xhs-auth`/`xhs-explore`/`xhs-interact`/`xhs-research`/`xhs-post-analytics`）。
  口语：小红书自动化体系、小红书能力总览。
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [xiaohongshu, publish, overview]
    related_skills:
      - xhs-auth
      - xhs-publish
      - xhs-explore
      - xhs-interact
---

# 小红书自动化 Skills

按用户意图路由到**叶子技能**；命令细节以各叶子 `SKILL.md` 为准（本页不做命令表副本）。

## When to use

- 需要小红书子技能总览或意图分流

## When not to use

- 已明确子任务 → 直接 `skill_view` 对应叶子（本总览不进 Hub）

## 技能边界

- 发布 / 登录 / 搜索 / 互动：`skills/publish/xiaohongshu/scripts/cli.py`（见对应叶子）
- 发前调研：`npm run xhs:research` → `xhs-research`
- 发后复盘：`npm run xhs:stats -- archive …` → `xhs-post-analytics`
- **禁止**外部 MCP/Go 小红书方案；复盘必须跑脚本，不要手工浏览器替代

## 意图 → 叶子

| 意图 | 叶子 |
|------|------|
| 登录 / 检查登录 | `xhs-auth` |
| 发布图文/视频 | `xhs-publish` |
| 搜索 / 详情 / 主页 | `xhs-explore` |
| 评论 / 点赞 / 收藏 | `xhs-interact` |
| 竞品/热点复合运营 | `xhs-content-ops` |
| 发前调研落盘 | `xhs-research` |
| 发后作品复盘 | `xhs-post-analytics` |

## 全局约束

- 发布和评论须用户确认；路径用绝对路径；控制频率

## 快速开始

```bash
python scripts/chrome_launcher.py
python scripts/cli.py check-login
# 具体子命令见各叶子 SKILL.md
```
