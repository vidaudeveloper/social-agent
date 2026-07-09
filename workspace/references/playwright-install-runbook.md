# Playwright 安装备忘（小红书卡片 / SAU 海外）

> **抖音发布已改用 SAU + 系统 Chrome**，不再使用 PVA 或 `tool/playwright-browsers`。抖音见 [`platform-login-quickstart.md`](platform-login-quickstart.md)。

## 适用范围

| 用途 | 安装命令 | 浏览器位置 |
|------|----------|------------|
| 小红书 MD→卡片 PNG | `npm run tool:install` | Auto-Redbook venv / 系统缓存 |
| YouTube / TikTok（SAU） | `npm run overseas:install` | 有系统 Chrome 可跳过 patchright 下载；否则 `tool/sau-playwright-browsers` |

## 国内镜像（SAU patchright 需下载时）

```powershell
$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://cdn.npmmirror.com/binaries/playwright"
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\tool\sau-playwright-browsers"
npm run overseas:install
```

## 已废弃（勿用）

- `npm run douyin:setup` — **已删除**
- `@panda-video-automation/pva` / `npx pva`
- `tool/playwright-browsers/` — 历史 PVA 残留，可手动删除释放空间

## 相关

- 依赖策略：[`dependency-policy.md`](dependency-policy.md)
- Bug 记录：[`docs/BUG.md`](../../docs/BUG.md)
