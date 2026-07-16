# social-agent 发展路线图

> 本文档登记**已有能力**、**待完善项**与**远期规划**。不引入 Spec；变更通过 Git 留痕。  
> 路由契约：[`workspace/references/skill-routing.md`](../workspace/references/skill-routing.md)

## 实施顺序

```text
1. 稳定一级意图识别 + 上下文读取顺序（当前阶段）
2. 补缺失叶子 skill（analytics / adapt / interact）
3. 评估 VidAU 计划调度 + Campaign 素材管理 + 反馈闭环
```

---

## 八类业务场景对照

| 场景 | 状态 | 现有入口 | 待建设 |
|------|------|----------|--------|
| 内容创作 | 已有 | `content-pipeline` / 编排器 | 口语触发词补全 |
| 选题灵感 | 已有 | Step 1 + `xhs-research` / `yt-viral-*` | 独立选题 skill（可选） |
| 规划排期 | **未建** | — | `plan-calendar` |
| 多平台改写 | 部分 | 编排器 Step 3 | `{code}-adapt` |
| 数据复盘 | 部分 | `yt/xhs/li-post-analytics` | dy/tt/x/zh/rd/wechat analytics |
| 账号定位 | 部分 | `user-profile.md` Step 0 | `position-persona` |
| 互动社群 | 部分 | `xhs-interact` | 其它平台 interact |
| 活动增长 | **未建** | — | campaign 策划 skill |

**Agent 遇到「未建」场景**：报告 capability gap，指向本表；禁止即兴实现。

---

## 已有但需完善

| 项 | 说明 |
|----|------|
| 意图路由 | `skill-routing.md` + `npm run skill-routing:eval` |
| 单平台发布 | 各 `{code}-publish` 叶子 + When 边界 |
| 发前调研 | `xhs-research`、`yt-viral-research` / `discover` |
| 发后复盘 | `xhs-post-analytics`、`yt-post-analytics`、`li-analytics` |
| 发布审核 | `review` + `review:lint` |
| 小红书互动 | `xhs-interact` |
| 视频成片 | `remotion` / `creative-agent`（TTS 已弃用） |
| Reference 治理 | [`workspace/references/README.md`](../workspace/references/README.md) |

---

## 计划建设（本轮不开发）

| 能力 | 依赖 | HITL 注意 |
|------|------|-----------|
| `plan-calendar` | 意图稳定 | 排期≠自动发布 |
| `position-persona` | user-profile | 初始化确认 |
| `{code}-adapt` | 各平台 publish 规范 | 改写后仍须 review |
| 更多 `*-post-analytics` | 各平台数据 API/导出 | 无数据不编造 |
| 更多 `*-interact` | 各平台 CLI | 评论须用户确认 |
| 跨平台 ROI / 策略反馈 | analytics 齐全 | 仅建议，不自动改发布 |

---

## 远期：自动化运营闭环

参考外部文档「定位→选题→排期→创作→审核→发布→互动→复盘→反馈选题」。

**本轮不改写** `pipeline-orchestrator` 或 `SOUL.md` 的执行步骤；不增加 Scheduler、状态机、自动发布。

闭环落地前提：

1. 意图识别与上下文读取顺序稳定
2. 各平台 analytics 叶子补齐（否则「发了就断」）
3. VidAU 计划 API 与 Campaign 素材边界确认

### VidAU Campaign / 计划（后续方向）

**前置依赖**：意图识别稳定后再设计。

初步方向（未实施）：

- Campaign 存 VI、产品、案例、参考素材（人可见上下文）
- `$HERMES_ROOT` 存正式成稿、图片、视频、报告
- VidAU **计划**触发意图请求 → social-agent Skill Gate → 叶子执行
- 不把 cron、资产库、全部状态塞进 `pipeline-orchestrator`
- 本轮：不设计数据模型、不实现同步、**不修改 VidAU 配置**

---

## 相关

- Bug 记录：[`bugs.md`](bugs.md)
- 技术债：[`technical-scheme-optimization.md`](technical-scheme-optimization.md)
