# 变更与修复记录

## 2026-07-09 — Remotion 横屏知识片：配音 AI 感 / 竖屏硬广

**需求**：横屏、知识分享软植入、配音更自然。

**改动**：
- 画幅改为 1920×1080；场景改为教程信息架构，去掉「立即体验/注册即享」话术。
- 品牌条改为「跨境网络笔记」栏目感；产品仅在经验段轻提 LycheeIP。
- TTS：`XiaoxiaoNeural` + rate `-8%` + pitch `-2Hz`；分段合成并插入 0.35s 静音（`scripts/generate-remotion-voiceover.mjs`）。
- Windows 下 `edge-tts --rate -8%` 会被吞参数，改为 `--rate=-8%` 写法。

**验证**：成片 `out/tiktok-ip-lycheeip.mp4` 1920×1080 · ~74.5s · 6.4MB。

## 2026-07-09 — Remotion 渲染缺 `@remotion/media`

**现象**：复制项目到 `D:\tmp` 后 `npm run still/render` 报错 `Can't resolve '@remotion/media'`（`package.json` 已声明但 `node_modules` 未装全）。

**修复**：在渲染目录执行 `npm install @remotion/media@^4.0.286 --save`，并同步回源项目 `package-lock.json`。

**验证**：`TikTokIpPromo` 渲染成功，`out/tiktok-ip-lycheeip.mp4` 约 49s / 5.5MB。

## 2026-07-09 — 移除抖音 PVA，统一 SAU 发布链路

**现象**：
- PVA 多次 `login` 堆积 Playwright Chromium → OOM；upload 前 `cookie_auth` 再开浏览器 → 同任务 2～3 个 Chrome。
- 视频未传完就填标题，发布页表单填写失败。

**修复**：
- 删除 PVA 全套（`douyin:setup`、`run-sau-douyin.mjs`、`install-douyin-playwright.*`）；`run-douyin.mjs` 仅包装 SAU。
- `cookie_file_ready()` 只读 JSON 校验；`douyin:check` 默认不开浏览器（`--online` 可选）。
- `upload` 单 browser context：`validate_base_args` 不再调 `cookie_auth`；`goto` 后 `_assert_upload_page_logged_in`；**先** `_wait_for_video_upload_complete` **再**填标题。
- `douyin_setup(handle=False)` cookie 有效则零浏览器；`ensure-deps` 抖音 marker 改为 `sau_cli.py`。

**命令**：
```powershell
npm run overseas:install
npm run douyin:login    # 仅一次
npm run douyin:check    # 只读 cookie
npm run douyin:upload -- --video "..." --title "..."
```

---

## 2026-07-09 — 抖音发布改用 SAU（系统 Chrome，避免 PVA 内存/OOM）

**现象**：
- PVA 多次 `login` 堆积 Playwright Chromium → OOM / 崩溃；session 在 npm 包目录，与 `npx` 路径不一致。
- SAU `patchright install chromium` 需 **chromium-1208**，国内 npmmirror **404**（无 `145.0.7632.6`）。

**修复**：
- 新增 `npm run douyin:sau-login` / `douyin:sau-check` / `douyin:sau-upload`（`scripts/run-sau-douyin.mjs`）。
- SAU 抖音 uploader 改为 **系统 Chrome**（`conf.LOCAL_CHROME_PATH` + `_launch_chromium`），无需再下 patchright 浏览器包。
- 修复上游 `_wait_for_douyin_login` 未定义 `original_url` / `saw_2fa` 导致登录立即失败。
- `overseas:install`：有系统 Chrome 时跳过 patchright 下载；Playwright 安装默认 npmmirror + `tool/sau-playwright-browsers`。

**验证**（2026-07-09）：
- Cookie：`tool/social-auto-upload/cookies/douyin_default.json`
- 上传测试视频 `SAU发布测试0907`，终端 `视频发布成功`，约 77s，exit 0。

## 2026-07-08 — skills 五层平铺重构（v2）

**变更**：将 `skills/social-media/` 拆分为 `explore/`、`create/`、`review/`、`publish/`、`analytics/` 五层平铺结构；`distribution.yaml` 改为单行 `skills/`；不创建 `social-publish/`。

**新增**：
- `workspace/references/platform-status.md`（平台三态唯一真相源）
- `workspace/references/dependency-policy.md`（按需安装 hint-only）
- `scripts/lib/ensure-deps.mjs`、`scripts/deps-check.mjs`（`npm run deps:check`）
- `scripts/lib/zhihu-html.mjs`
- 各层 `README.md` 与 `skills/README.md` 总索引

**路径迁移示例**：
- `skills/social-media/pipeline-orchestrator` → `skills/create/pipeline-orchestrator`
- `skills/social-media/xiaohongshu` → `skills/publish/xiaohongshu`
- `skills/youtube` 短路径 → `skills/publish/youtube`

**X 平台状态更正**：链路 √（baoyu-post-to-x）；⚠️ 部分账号被平台限发。signal-fire 已废弃。

## 2026-07-08 — create/video 按类型重组 + Remotion skill

**变更**：`skills/create/video/` 由按平台划分改为按成片类型：`tts-narration/`、`remotion/`、`creative-agent/`。

**新增**：vendored [remotion-dev/skills](https://github.com/remotion-dev/skills)（约 120KB 规则）于 `skills/create/video/remotion/`；`npm run remotion:check` 完整性检查。

**路径迁移**：`video/{douyin,tiktok,youtube}/*-create` → `video/tts-narration/{douyin,tiktok,youtube}/`。

**变更**：`skills/content-reviewer/` 与 `skills/reviewer/` 合并为 `skills/review/`；Hermes skill ID 改为 `review`；`npm run review:lint` / `review:sync-specs` 路径更新。

## 2026-07-08 — Remotion 配音脚本 edge-tts 长文本失败

**现象**：`node scripts/generate-remotion-voiceover.mjs` 使用 `--text` 传入整段中文旁白时，Windows 下 edge-tts 报 `unrecognized arguments`。

**修复**：改为先写入 `public/narration.txt`，再用 `-f` 文件参数调用 edge-tts。


**现象**：
- `npx playwright install chromium` 从 `cdn.playwright.dev` 下载约 **300MB**（Chrome 183MB + Headless Shell 114MB + FFmpeg），进度常在 **40%–60%** 假死数分钟至数小时。
- Agent 在 Cursor 沙箱执行时，浏览器落到 `C:\Users\...\AppData\Local\Temp\cursor-sandbox-cache\...\playwright\`（**C 盘临时目录**），与项目脱节。
- 用户手动设 D 盘路径但走海外 CDN，同样在 60% 卡住。

**根因**：
1. 国内访问 `cdn.playwright.dev` 慢/不稳定。
2. 未设 `PLAYWRIGHT_BROWSERS_PATH`，Playwright 默认 `%LOCALAPPDATA%\ms-playwright`（Windows）或系统缓存（macOS）。
3. npmmirror **没有** Playwright 1.58 所需的 `145.0.7632.6`（404）；PVA 实际需 **1.61.x / chromium v1228 / 149.0.7827.55**（镜像有该版本）。

**解决过程（Agent 应复用）**：
1. 结束卡住的 `node` / `playwright install` 进程。
2. 设置 `PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright`。
3. 设置 `PLAYWRIGHT_BROWSERS_PATH={profile}/tool/playwright-browsers`（**与项目 `tool/` 同级，禁止默认 C 盘**）。
4. 执行 `npx playwright@1.61.1 install chromium`（或 `npm run douyin:setup`）。
5. 国内镜像约 **1 分钟** 装完；`run-douyin.mjs` 注入路径后 `douyin:upload` 通过。

**代码/文档**：
- `npm run douyin:setup`（Win: `install-douyin-playwright.ps1`，Mac: `install-douyin-playwright.sh`）
- Agent 专文：[`workspace/references/playwright-install-runbook.md`](../workspace/references/playwright-install-runbook.md)
- `run-douyin.mjs` 自动注入 `PLAYWRIGHT_BROWSERS_PATH` 并检查 headless shell marker

**验证**：`douyin:upload` 上传测试视频成功（约 1.1 分钟，已点发布按钮）。

## 2026-07-08 — 放弃 signal-fire X，正式采用 baoyu-post-to-x

**结论**：signal-fire X 登录无法稳定成功（PoC 失败）；**X 平台唯一方案**为 `baoyu-post-to-x`。

**策略调整**：
- 移除 `signal-fire:x-login` / `x-draft` / `x-publish` npm 脚本及相关 wrapper
- 默认 **操作后不关闭 Chrome**（`X_CLOSE_BROWSER=false`），减少频繁启停被风控识别
- `x:login` 打开 Chrome 时启用 `remote-debugging-port`，登录后验证 `auth_token` + `ct0` 写入 profile
- `x:check-login` 改为真实 cookie 检测，避免用户反复登录
- `x:setup` 自动 patch 上游 `x-browser.ts` / `x-video.ts` 保持浏览器打开

**Profile 路径**：`%APPDATA%\baoyu-skills\chrome-profile`（与 signal-fire `~/.signal-fire` 互不共享）

## 2026-07-08 — baoyu-post-to-x 接入与 X 填稿试跑通过

**现象**：
1. `scripts/lib/baoyu-x.mjs` 缺失，`skills/publish/x/scripts/cli.mjs` import 路径错误
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

**修复**：废弃 `skills/publish/linkedin/scripts/` 自研 CLI（已删除废弃 README），接入上游 [gxbvc/linkedin-cli](https://github.com/gxbvc/linkedin-cli)；新增 `npm run linkedin:setup` / `run-linkedin.mjs`。Redirect URL 改为 `http://localhost:3457/callback`。

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
