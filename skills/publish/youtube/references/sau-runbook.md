# YouTube / sau 问题排查 Runbook（Agent 参考）

> **适用场景**：YouTube 发布失败、sau 命令报错、check 返回 invalid、ModuleNotFoundError、误删 `sau_cli.py` 等。  
> **原则**：仅 sau 单路径；禁止 Playwright 回退；禁止 Agent 连跑 login/check。

---

## 快速决策树

```
YouTube 出问题
    │
    ├─ ModuleNotFoundError / sau 命令找不到
    │     → 【章节 A】安装与 sau_cli 恢复
    │
    ├─ login 成功但 check 返回 invalid
    │     → 【章节 B】cookie 校验 patch + 代理
    │
    ├─ 从未登录 / cookie 文件不存在
    │     → 【章节 C】一次性登录（须用户确认）
    │
    ├─ publish 失败（cookie 相关）
    │     → 先 B，仍失败再 C（间隔 ≥30 分钟）
    │
    └─ 上传卡在进度条
          → 【章节 D】保持浏览器窗口直到 100%
```

---

## 章节 A：安装与 sau_cli 恢复

### 症状

- `ModuleNotFoundError: No module named 'utils.base_social_media'`
- `social-auto-upload 未安装`
- `sau 失败` / `sau_cli.py` 不存在
- 使用 `python sau_cli.py` 报错

### 根因

1. `tool/social-auto-upload` 未 clone 或未 `uv pip install -e .`
2. 误用 `python sau_cli.py`（不会自动加入 `sys.path`）
3. `sau_cli.py` 被误删/移动（例如测试时 `mv sau_cli.py sau_cli.py.bak` 后未恢复）

### 修复步骤（按顺序，不可跳步）

```powershell
# 仓库根目录
cd social-agent   # profile 根目录，见 https://github.com/vidaudeveloper/social-agent

# A1. 若 tool/ 未安装
npm run overseas:install

# A2. 进入 sau 目录
cd tool/social-auto-upload

# A3. 若 sau_cli.py 丢失，从备份恢复
# Test-Path sau_cli.py
# 若 False：Copy-Item sau_cli.py.bak sau_cli.py

# A4. 配置文件（首次）
# 若 conf.py 不存在：Copy-Item conf.example.py conf.py

# A5. editable 安装（必做）
uv pip install -e .

# A6. 验证入口（必须用 sau，不要用 python sau_cli.py）
uv run sau youtube --help

# A7. 回到仓库根目录，打 YouTube patch（必做，尤其恢复 sau_cli 后）
cd ../..
npm run youtube:patch-sau
```

### 成功标准

- `uv run sau youtube --help` 正常输出子命令
- `Test-Path tool/social-auto-upload/sau_cli.py` 为 True
- patch 输出 `[ok] patched` 或 `already applied`

### 禁止操作

- ❌ `uv run python sau_cli.py` 或裸 `python sau_cli.py` 作为常规入口
- ❌ 未 `uv pip install -e .` 就直接 check/publish
- ❌ 恢复 `sau_cli.py` 后跳过 `npm run youtube:patch-sau`

---

## 章节 B：login 成功但 check 返回 invalid

### 症状

- `sau youtube login` 成功，cookie 文件约 16KB，含 `LOGIN_INFO`、`SID`、`HSID` 等
- `sau youtube check --account default` 仍输出 `invalid`
- 或 `npm run youtube:check-login` → `loggedIn: false`

### 根因（非 cookie 未保存）

**发布**：须走本仓 `skills/publish/youtube/scripts/commands/publish.mjs`，已自动追加 `--headed`。裸调 `sau youtube upload-video` 且漏 `--headed` 会在 YouTube Studio 失败。

**check** 不是读 json 字段，而是**再开浏览器访问 Studio** 验证。上游默认逻辑有缺陷：

| 问题 | 说明 |
|------|------|
| headless check | login 有界面，check 无界面 → Google 易误判 |
| URL 过严 | 要求 URL 含 `/channel/`，部分 Studio 页不满足 |
| 无 YT_PROXY | 国内 patchright 不吃系统代理，check 连不上 YouTube |
| 静默失败 | 异常被吞，只返回 invalid |

### 修复步骤

```powershell
# B1. 打 patch（修复 cookie_auth）
npm run youtube:patch-sau

# B2. 国内配置代理（编辑 tool/social-auto-upload/conf.py）
# YT_PROXY = "http://127.0.0.1:7890"   # 改成实际代理端口

# B3. 验证（须用户已设 OVERSEAS_ALLOW_AUTOMATION）
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:check-login
```

### 成功标准

- `uv run --directory tool/social-auto-upload sau youtube check --account default` → `valid`
- 或 `npm run youtube:check-login` → `"loggedIn": true`

### check 仍 invalid 时

1. 看 sau 日志是否输出 `cookie 校验失败: ...` 或 `cookie 校验异常: ...`（patch 后才有）
2. **勿立即 re-login**，间隔至少 30 分钟
3. 可直接试 `publish`（publish 默认有头，有时 check 失败但 publish 能成）
4. 仍失败 → 走【章节 C】，且仅一次 login

---

## 章节 C：一次性登录（人工）

### 何时执行

- cookie 文件不存在：`tool/social-auto-upload/cookies/youtube_default.json`
- publish 明确提示 cookie 失效
- 用户明确要求重新登录

### 步骤

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
$env:SAU_HEADED = "true"
npm run youtube:login
```

用户在弹出 Chrome 中完成 Google/YouTube 登录；cookie 保存到：

```
tool/social-auto-upload/cookies/youtube_<account>.json
```

默认 account 为 `default`（环境变量 `YOUTUBE_ACCOUNT_ID` 可改）。

### Agent 约束

- 须 `OVERSEAS_ALLOW_AUTOMATION=true`（用户终端显式设置）
- **禁止** Agent 自动连跑 `login` → `check-login` → `login`
- 登录成功后，日常**只 publish**，少跑 check

---

## 章节 D：上传卡在进度条

- 保持浏览器窗口打开直到 100%
- 大文件需更长时间；不要提前关窗

---

## 章节 E：日常发布（推荐工作流）

```powershell
# 已 login 一次的前提下，日常只需：
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:publish -- `
  --video "$CONTENT_ROOT/视频/xxx.mp4" `
  --title "标题" `
  --privacy unlisted
```

---

## 关键路径速查

| 项 | 路径 / 命令 |
|----|-------------|
| sau 根目录 | `tool/social-auto-upload` |
| 唯一 cookie | `tool/social-auto-upload/cookies/youtube_default.json` |
| 代理配置 | `tool/social-auto-upload/conf.py` → `YT_PROXY` |
| Node 封装 CLI | `node skills/publish/youtube/scripts/cli.mjs` |
| sau 调用封装 | `scripts/lib/sau.mjs` → `uv run sau` |
| YouTube patch | `npm run youtube:patch-sau` |
| 安装脚本 | `npm run overseas:install` |

---

## Agent 执行清单（遇到 YouTube 问题时）

按顺序勾选，完成一步再下一步：

- [ ] 1. 确认 `tool/social-auto-upload/sau_cli.py` 存在；缺失则从 `.bak` 恢复
- [ ] 2. `cd tool/social-auto-upload; uv pip install -e .`
- [ ] 3. `uv run sau youtube --help` 能跑通
- [ ] 4. `npm run youtube:patch-sau` 已执行
- [ ] 5. 国内检查 `conf.py` 是否配置 `YT_PROXY`
- [ ] 6. 若仅 check invalid 且 cookie 存在 → **不要 re-login**，先 patch + 代理，再 check 一次
- [ ] 7. 验证：`npm run youtube:check-login`（须用户设 `OVERSEAS_ALLOW_AUTOMATION=true`）
- [ ] 8. 日常发布用 `npm run youtube:publish`，不要切换其他登录路径

---

## 相关文档

- CLI 契约：`skills/publish/youtube/skills/yt-upload/references/cli-contract.md`
- 运行前提：`skills/publish/youtube/skills/yt-upload/references/runtime-requirements.md`
- 海外自动化门禁：`references/overseas-automation-rules.md`
- Bug 记录：`BUGS.md`（搜索「sau check invalid」）
