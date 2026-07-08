# 变更与修复记录

## 2026-07-08 — baoyu-post-to-x 接入与 X 填稿试跑通过

**现象**：
1. `scripts/lib/baoyu-x.mjs` 缺失，`skills/social-media/x/scripts/cli.mjs` import 路径错误
2. `tool/baoyu-skills` 残留不完整 clone（仅 `.git/objects/pack/tmp_pack_*`），`x:setup` 无法继续
3. GitHub HTTPS clone 在本机超时

**修复**：
- 新增 `baoyu-x.mjs`、`run-x.mjs`、`install-baoyu-x-tools.ps1`；`overseas-guard.mjs` 补 `mayLaunchBrowser` / `printManualLoginSteps`
- `x:login` 只打开一次 `x.com/i/flow/login`，不轮询刷新
- 安装脚本 HTTPS 失败自动改 SSH；检测到不完整目录时 fallback 到 `tool/baoyu-skills-vendor`
- 修正 `cli.mjs` 中 `overseas-guard` 的 import 路径（`../../../../scripts/...`）

**验证**（2026-07-08 11:38 北京时间）：
- `npm run x:preflight` ✅
- `npm run x:publish -- --text "baoyu 填稿测试 1138"` ✅（已登录态下打开 compose、填稿，未点 Post）

## 2026-07-08 — signal-fire X 登录脚本反复刷新登录页

**现象**：`signal-fire:x-login` 打开 X 登录页后，每 3 秒轮询 `isLoggedIn()`，页面被反复跳转到首页/登录流，用户无法完成手动登录。

**原因**：上游 `isLoggedIn(page)` 内部每次都会 `page.goto(x.com/home)`；轮询调用等于持续刷新。

**修复**：`scripts/signal-fire-x-login-wait.mjs` 改为只打开登录页一次 → 用户手动登录 → 终端 **Enter 确认** → 再调用一次 `isLoggedIn` 验证并保存 profile。禁止轮询。

## 2026-07-06 — 平台验证状态更正

**更正**：文档原先将抖音、公众号等标为「链路就绪」不准确。

**实际端到端测试通过**：知乎、小红书、Reddit、YouTube、TikTok。

**尚未测试通过**：抖音、公众号、LinkedIn、X（代码已接入，默认只出稿，不自动发布）。

**文档同步**：`README.md`、`SOUL.md`、`pipeline-orchestrator/SKILL.md`、`platform-login-quickstart.md`。

## 2026-07-06 — 管线体验：配图安装、发布确认路径、小红书首页验收

**现象**：
1. `xhs-card-render` 技能已加载但 `tool/Auto-Redbook-Skills` 未安装，Agent 误降级 tokenware
2. 发布前确认只给摘要，无文件绝对路径
3. 小红书发布后停在发布页，不跳创作中心首页
4. 选题搜索每次结果雷同

**修复**：
- 新增 `npm run tool:install`、`pipeline:xhs`、`xhs:card-render` 与安装脚本
- `workspace/references/publish-confirm-paths.md`：Step 4.9 强制绝对路径（含 Win/Mac 示例）
- `publish`/`click-publish` 默认首页验收（`--no-verify` 可跳过），浏览器停留首页；未匹配时 `user_decision` 询问是否重发
- `workspace/references/platform-login-quickstart.md` 登录速查
- `workspace/references/topic-research-diversity.md` 选题多样化规则

## 2026-07-06 — TikTok login 一闪而过、假 ok

**现象**：`tiktok:login` 秒退且 `ok: true`，但 `check-login` 为 `loggedIn: false`；用户看不到登录页。

**根因**：SAU `conf.py` 默认 `LOCAL_CHROME_HEADLESS=True`；`get_tiktok_cookie` 用 `page.pause()` 依赖 Playwright Inspector，无头/未 Resume 时立即保存空 cookie。

**修复**：`cli.py` 改交互式有头 Chrome + 终端 Enter 确认后存 cookie；`overseas:install` 初始化 `conf.py` 为 `HEADLESS=False` 并尽量指向系统 Chrome。

**后续**：Enter 后立即 `storage_state` 仍可能缺 `sessionid`；改为 Enter 后跳转 TikTok Studio 上传页校验，未通过保持浏览器可重试；`check-login` 与发布流程同源校验（上传 iframe/按钮），替代 SAU `cookie_auth` 的 select 误判。

## 2026-07-06 — TikTok 登录页一直加载

**现象**：Chrome 打开 TikTok 后长时间转圈，无法进首页/完成登录。

**根因**：国内网络下 Playwright 不走系统代理；未配 `TK_PROXY` 时 tiktok.com 不可达。另：登录页注入 `stealth.min.js` 可能加重异常。

**修复**：登录改用 `launch_persistent_context` + 系统 `channel=chrome`、去掉登录阶段 stealth；支持 `TK_PROXY`/`TIKTOK_PROXY`（可复用 `YT_PROXY`）；启动时提示配代理；改开首页而非 /login。

## 2026-07-06 — TikTok 草稿发布与弹窗遮挡

**现象**：`tiktok:publish --draft` 上传后填标题失败，TUXModal 弹窗挡住编辑器。

**修复**：publish 不再 `tiktok_setup` 二次开浏览器；`--draft` 点 Save draft；自动关闭 Got it/Allow/**Turn on automatic content checks**（优先 Cancel）等 TUXModal。

## 2026-07-06 — TikTok 依赖与路径修复

**现象**：`npm run tiktok:check-login` 报 social-auto-upload 未找到；`overseas:install` 需手动 clone；SAU 缺 `conf.py` 导致 import 失败。

**修复**：
- `overseas:install` 自动 clone SAU、复制 `conf.example.py` → `conf.py`、在 SAU `.venv` 安装 playwright
- `cli.py` `repo_root` 修正为 profile 根目录（`parents[4]`）
- `run-tiktok.mjs` 使用绝对 `SAU_ROOT`
- 补全 `package.json`：`pipeline:tiktok` / `tiktok:create-video` / `tiktok:voices`
- `check-login` 未登录时仍返回 exit 0（`loggedIn: false`）

## 2026-07-06 — LinkedIn 改用 gxbvc/linkedin-cli

**现象**：自研 OAuth 仅请求 `openid` 或 scope 不完整时，授权回调 `openid_insufficient_scope_error`。

**修复**：废弃 `skills/social-media/linkedin/scripts/` 自研 CLI，接入上游 [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli)；新增 `npm run linkedin:setup` / `run-linkedin.mjs`。Redirect URL 改为 `http://localhost:3457/callback`。

## 2026-07-06 — 开源合规与文档统一

- 统一安装仓库为 `vidaudeveloper/social-agent`
- 新增 `LICENSE`、`NOTICE.md`；清理子 skill 引流与旧仓库地址
- 路径占位符：`$HERMES_ROOT` / `./content`

## 2026-07-03 — tokenware 403：模型 ID

**现象**：首条对话 403，`Model 'deepseek-v4-flash' not found`

**根因**：tokenware 模型 ID 为 `DeepSeek：DeepSeek V4 Flash`（全角冒号），非官方 slug。

**修复**：`config.yaml` 使用正确模型名；详见 `workspace/references/tokenware-models.md`。旧会话可能锁定错误模型，需新建对话。

## 2026-07-03 — 海外工具与配置保护

**现象**：TikTok login 缺 playwright；Agent 误改 `config.yaml` model 段。

**修复**：新增 `npm run overseas:install`、`scripts/run-tiktok.mjs`；`SOUL.md` 与 `agent-config-guardrails.md` 禁止 Agent 改 model。
