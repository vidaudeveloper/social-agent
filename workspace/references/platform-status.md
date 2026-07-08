# 平台状态（唯一维护源）

> 全项目平台验证状态**只维护本文件**。README、SOUL、pipeline-orchestrator 等请链接引用，勿复制表格。

## 三态符号

| 符号 | 含义 |
|------|------|
| **√** | 指定 CLI/API 链路测试通过（login → 创作/填稿 → publish） |
| **×** | 未接入 publish skill，或链路未端到端测通 |
| **⚠️** | 非代码问题（写在备注列，可与 √ 共存） |

## 平台一览

| 平台 | 方案 | 状态 | 备注 |
|------|------|------|------|
| 知乎 | pyzhihu-cli + HTML 发布 | √ | — |
| 小红书 | XHS Bridge + `pipeline:xhs` | √ | 卡片配图按需 `npm run tool:install` |
| Reddit | reddit-skills 扩展桥 | √ | ⚠️ Chrome 中 Reddit 界面须 English |
| YouTube | social-auto-upload | √ | 按需 `npm run overseas:install` |
| TikTok | SAU tk_uploader | √ | ⚠️ 国内需 `TK_PROXY`；按需 overseas:install |
| X (Twitter) | baoyu-post-to-x | √ | ⚠️ 部分账号被平台限发（非 CLI 故障） |
| 抖音 | PVA + dy-create | × | 代码在仓，未 E2E 验证 |
| LinkedIn | gxbvc/linkedin-cli | × | OAuth 已接，未 E2E 验证 |
| 公众号 | baoyu-post-to-wechat（文档） | × | 无本仓 publish skill / install 脚本 |
| Instagram | content-reviewer 规则 | × | 仅审核规格，无发布 |
| Facebook | content-reviewer 规则 | × | 仅审核规格，无发布 |

## 默认发布策略

- **√ 且用户 profile 启用**：管线 Step 5 可自动 publish
- **×**：默认只归档文稿到 `$HERMES_ROOT/文章/{平台}/`，不执行 publish CLI，除非用户明确要求
- **⚠️**：链路可用；失败时先排查备注项（语言、代理、账号风控），再查 CLI

## 相关文档

- 登录速查：[`platform-login-quickstart.md`](platform-login-quickstart.md)
- 依赖安装：[`dependency-policy.md`](dependency-policy.md)
- Skills 分层：[`../../skills/README.md`](../../skills/README.md)
