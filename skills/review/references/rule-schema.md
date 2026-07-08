# 规则文件 Schema

`rules/` 下规则分两类：

| 类型 | 来源 | 可否手改 |
|------|------|----------|
| CSV 同步平台 | `npm run review:sync-specs` 从 `specs/platform-publish-standards.csv` 生成 | 否 |
| 手写平台 | `reddit`、`wechat`、`douyin`、`x`、`_common` | 是 |

CSV 同步文件首行含 `# AUTO-GENERATED` 注释。

## 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platform` | string | 平台 ID，如 `xiaohongshu`、`zhihu` |
| `display_name` | string | 展示名 |
| `version` | number | 规则版本 |
| `checks` | array | 检查项列表 |
| `forbidden` | object | 禁则标记（文档用，部分由 checks 执行） |

## checks 条目

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `severity` | 是 | `error` \| `warn` \| `info` |
| `type` | 是 | `script` \| `pattern` \| `rubric` |
| `handler` | script 时 | 如 `limits.titleMaxLength`、`xhs.titleLength`、`zhihu.noPipeTables` |
| `params` | 否 | handler 参数（如 `{ max: 20 }`） |
| `carrier` | 否 | 内容载体；lint 默认仅检查 `primary: true` 行 |
| `primary` | 否 | 默认载体（含 CSV「主推」或平台首行） |
| `source_text` | 否 | 对应 CSV 原文，便于追溯 |
| `pattern` | pattern 时 | 正则字符串 |
| `prompt` | rubric 时 | Agent 软检查说明 |

## type 分工

- **script**：由 `npm run review:lint` 执行，结果写入 JSON
- **pattern**：由 lint 对正文做正则匹配
- **rubric**：由 Agent 读 YAML 内 `prompt` 人工/LLM 判断，写入报告

## 平台 ID 映射

| platform | 规则文件 |
|----------|----------|
| xiaohongshu / xhs | xiaohongshu.yaml |
| zhihu | zhihu.yaml |
| wechat / 公众号 | wechat.yaml |
| douyin | douyin.yaml |
| youtube | youtube.yaml |
| tiktok | tiktok.yaml |
| reddit | reddit.yaml |
| linkedin | linkedin.yaml |
| x / twitter | x.yaml |

## 扩展 handler

在 `scripts/lib/` 新增模块，在 `lint.mjs` 的 handler 表中注册 `namespace.method` 即可。
