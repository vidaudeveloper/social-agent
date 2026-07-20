---
name: skill-routing-eval
description: |
  技能路由离线评测（meta-workspace / review 层）。不接触真实账号；用典型用户请求集检测分层意图与 skill 选型。
  触发：「测路由」「skill routing eval」「评测技能选择」「回归路由」。
  口语：跑路由测试、检查误触发、漏选 skill、路由准确率。
version: 2.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: [eval, routing, regression, review, meta-workspace]
    related_skills:
      - review
---

# 技能路由评测（skill-routing-eval）

**不执行发布/登录/真实 CLI。** 仅用于验证：给定用户请求 → 请求域 / 路由状态 / 原子意图 / 流程范围 / 叶子 skill 选型是否合理。

## When to use

- 修改 `skill-routing.md`、叶子 `description` / When 节、`pipeline-orchestrator` 后做回归
- 用户或维护者要求「测路由」「检查误触发/漏选」
- 新增平台叶子 skill 后补充 `tests/skill-routing/cases.yaml` 用例

## When not to use

- 真实发帖、登录、拉线上数据 → 对应 publish/auth/analytics 叶子
- 评测业务 CLI 是否成功 → 各平台自己的脚本测试

## 资源

| 路径 | 说明 |
|------|------|
| [`workspace/references/skill-routing.md`](../../../workspace/references/skill-routing.md) | 分层路由契约（被测对象） |
| [`tests/skill-routing/cases.yaml`](../../../tests/skill-routing/cases.yaml) | 典型请求集（含 schedule / meta / gap） |
| [`scripts/eval-skill-routing.mjs`](../../../scripts/eval-skill-routing.mjs) | 离线路由打分脚本 |

## 运行

```powershell
# profile 根目录
npm run skill-routing:eval

# 详细输出
npm run skill-routing:eval -- --verbose

# 调整 Recall@K
npm run skill-routing:eval -- --k 5
```

## 指标

| 指标 | 含义 |
|------|------|
| Intent accuracy | 七类原子意图启发式是否命中 |
| Strict Top-1 skill match | 第一名是否为期望叶子（严格） |
| Recall@K | 期望 skill 是否出现在前 K |
| False-positive cases | `forbid_skills` 误入 **Top-min(K,3)**（计入失败；扩大 K 只用于 Recall） |
| Capability-gap / route_status | 缺口、澄清、out-of-scope、partial-support、schedule 是否判对 |
| Miss cases | 期望 skill 未进 Top-K |

`forbid_actions`（如 `bare_npx`、`ad_hoc_script`）与 `forbid_context` 供**在线 Agent dry-run 轨迹**检查；离线路由脚本仅报告策略项，不模拟执行。

## 维护

1. 新增混淆对 → 同时改 `skill-routing.md`、相关叶子 When 节、`cases.yaml`
2. 失败用例先判断：是描述不清还是启发式评测局限（歧义句可加 `recall_any: true`）
3. 复合意图用 `expect_chain` / `expect_workflow_scope`；定时用 `expect_schedule` + `capability-gap`
4. CI/本地发布前建议：`npm run skill-routing:eval` 通过后再合并路由相关改动
