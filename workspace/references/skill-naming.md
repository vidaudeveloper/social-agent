# 技能命名规范（维护者）

> Agent 日常执行**不必**读本文。新增 / 改名 skill 时维护者必读。  
> 结构原则对齐 [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)：叶子精简、`description` 含触发词、长文下沉。

VidAU Hub 用路径**最后一段**作为安装目录名；末段撞名会导致 `Skill name collision` / `Unknown skill(s)`。

## 双层命名

| 层级 | 用途 | 规则 | 例子 |
|------|------|------|------|
| **中层目录** | 给人看、挂 `scripts/` | 可读全称，本层内唯一 | `skills/publish/wechat` |
| **叶子技能** | Agent / Hub 的 `name:` | `{平台码}-{能力}`，**目录名 = `name:`**，全局唯一 | `wechat-publish`、`yt-auth` |

中层可以叫 `youtube`；叶子**禁止**裸平台词当地目录名。

## 平台码

| 平台 | 码 |
|------|-----|
| 抖音 | `dy` |
| TikTok | `tt` |
| YouTube | `yt` |
| 小红书 | `xhs` |
| X | `x` |
| LinkedIn | `li` |
| 知乎 | `zh` |
| Reddit | `rd` |
| 微信公众号 | `wechat` |

## 能力后缀

| 后缀 | 含义 |
|------|------|
| `-auth` | 登录 / 鉴权 |
| `-publish` | 发布 |
| `-create` | 成片/创作 |
| `-interact` | 互动 |
| `-upload` | 上传契约 |
| `-analytics` / `-post-analytics` | 发后复盘 |
| `-skills` | 平台总览（**不进 Hub**） |

## 骨架

```text
skills/publish/{platform}/
  SKILL.md                 # name: {code}-skills（不进 Hub）
  scripts/
  skills/
    {code}-auth/SKILL.md
    {code}-publish/SKILL.md
```

## frontmatter（统一）

```yaml
name: example-skill
description: |
  …对象 + 产出 + 触发词…
version: 1.0.0
author: social-agent
license: MIT
metadata:
  vidau:
    tags: []
    related_skills: []
```

不强制 `emoji` / `os` / `requires`（易跨技能不一致）。

## Hub 规则

1. 叶子目录名 = `name:`
2. Hub `paths` **只列叶子**，不要列父目录或 `{code}-skills`
3. 新增前全库搜同名

## 反例

| 错误 | 原因 |
|------|------|
| 叶子目录叫 `youtube` | Hub 末段撞车 |
| 只改 `name:` 不改目录名 | Hub 仍按目录末段装 |
| 装父路径留残影 | Ambiguous skill |

publish 落地见 [`../skills/publish/README.md`](../../skills/publish/README.md)。
