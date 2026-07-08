# Playwright 浏览器安装 Runbook（Agent 必读）

> 抖音 PVA（`douyin:login` / `douyin:upload`）依赖 Playwright 自带的 Chromium。**禁止**裸跑 `npx playwright install` 不设路径、不设镜像——国内极易卡死或装到 C 盘沙箱缓存。

## 适用场景

| 用途 | 安装命令 | 浏览器路径 |
|------|----------|------------|
| **抖音发布（PVA）** | `npm run douyin:setup` | `{profile}/tool/playwright-browsers` |
| YouTube / TikTok（SAU） | `npm run overseas:install` | SAU `.venv` 内 Playwright 默认路径 |
| 小红书卡片（Auto-Redbook） | `npm run tool:install` | 同上，随 Auto-Redbook venv |

本文重点：**抖音 PVA**。

---

## Agent 排障流程（安装失败 / 卡在 60%）

1. **先结束卡住的进程**（Windows 示例）：
   ```powershell
   Get-CimInstance Win32_Process -Filter "name='node.exe'" |
     Where-Object { $_.CommandLine -match 'playwright' } |
     ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
   ```
2. **不要**继续用官方 `cdn.playwright.dev` 硬下（约 300MB，国内常假死）。
3. **改用国内镜像** + **固定浏览器目录到项目 `tool/`**：
   ```powershell
   npm run douyin:setup
   ```
4. 若镜像 404：PVA 当前需要 **Playwright 1.61.x**（`chromium v1228` / `149.0.7827.55`）。**不要**强行装 `playwright@1.58`（npmmirror 可能无 `145.0.7632.6`）。
5. 安装后验证 marker 存在：
   - Windows: `tool/playwright-browsers/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe`
   - macOS ARM: `.../chrome-headless-shell-mac-arm64/chrome-headless-shell`
   - macOS Intel: `.../chrome-headless-shell-mac-x64/chrome-headless-shell`
6. 再跑 `npm run douyin:login` → `npm run douyin:upload`。

---

## 路径策略（Windows 禁止默认 C 盘）

| 错误做法 | 后果 |
|----------|------|
| 裸 `npx playwright install chromium` | 默认 `%LOCALAPPDATA%\ms-playwright` 或 Cursor 沙箱 `Temp\cursor-sandbox-cache\...\playwright`（**C 盘**） |
| Agent 后台安装不设 `PLAYWRIGHT_BROWSERS_PATH` | 与项目脱节，PVA 找不到浏览器 |

**正确做法**：浏览器与 `tool/baoyu-skills-vendor`、`tool/social-auto-upload` 同级：

```
social-agent-profile/
└── tool/
    └── playwright-browsers/    ← PLAYWRIGHT_BROWSERS_PATH（gitignore，clone 不提交）
        ├── chromium-1228/
        ├── chromium_headless_shell-1228/
        └── ffmpeg-1011/
```

`run-douyin.mjs` 会自动注入 `PLAYWRIGHT_BROWSERS_PATH={profile}/tool/playwright-browsers`。

可用环境变量覆盖：`PLAYWRIGHT_BROWSERS_ROOT` 或 `PLAYWRIGHT_BROWSERS_PATH`。

---

## Windows 安装（推荐）

```powershell
cd <social-agent-profile 根目录>
npm run douyin:setup
```

等价手动命令：

```powershell
$ProfileRoot = (Get-Location).Path
$env:PLAYWRIGHT_BROWSERS_PATH = "$ProfileRoot\tool\playwright-browsers"
$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://cdn.npmmirror.com/binaries/playwright"
New-Item -ItemType Directory -Force -Path $env:PLAYWRIGHT_BROWSERS_PATH | Out-Null
npx playwright@1.61.1 install chromium
```

**耗时**：国内镜像约 **1–2 分钟**；海外 CDN 可能 **30+ 分钟仍卡住**。

---

## macOS 安装

```bash
cd <social-agent-profile 根目录>
npm run douyin:setup
```

等价手动命令：

```bash
export PLAYWRIGHT_BROWSERS_PATH="$(pwd)/tool/playwright-browsers"
export PLAYWRIGHT_DOWNLOAD_HOST="https://cdn.npmmirror.com/binaries/playwright"
mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
npx playwright@1.61.1 install chromium
```

Apple Silicon 与 Intel 均使用上述命令；Playwright 会按架构下载 `mac-arm64` 或 `mac-x64`。

---

## 环境变量速查

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `PLAYWRIGHT_BROWSERS_PATH` | `{profile}/tool/playwright-browsers` | 浏览器二进制目录，**必须**与项目放一起 |
| `PLAYWRIGHT_DOWNLOAD_HOST` | `https://cdn.npmmirror.com/binaries/playwright` | 国内镜像；失败再考虑代理后走官方 CDN |
| `PLAYWRIGHT_BROWSERS_ROOT` | 同 `PLAYWRIGHT_BROWSERS_PATH` | 安装脚本别名，便于 Agent 识别 |

---

## 常见错误

| 报错 | 处理 |
|------|------|
| 下载进度停在 40%–60% 不动 | 杀进程 → `npm run douyin:setup`（镜像） |
| `Executable doesn't exist at ...chromium_headless_shell...` | 未装完 Headless Shell → 重跑 `douyin:setup` |
| 镜像 `404 NoSuchKey` + `145.0.7632.6` | 版本过旧，改用 `playwright@1.61.1` |
| `spawnSync npx.cmd EINVAL` | Windows 下用 `shell: true` 拼命令（已在 `run-douyin.mjs` 处理） |

---

## 相关文档

- Bug 记录：[`docs/BUG.md`](../../docs/BUG.md)「抖音 PVA Playwright 安装卡住」
- 登录速查：[`platform-login-quickstart.md`](platform-login-quickstart.md)「抖音」
- 依赖策略：[`dependency-policy.md`](dependency-policy.md)
