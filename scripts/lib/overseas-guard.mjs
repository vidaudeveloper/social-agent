#!/usr/bin/env node
/**
 * 海外平台自动化门禁 — Agent 默认须用户显式开启 OVERSEAS_ALLOW_AUTOMATION=true
 */
export function requireOverseasConsent(platform, action) {
  if (process.env.OVERSEAS_ALLOW_AUTOMATION !== 'true') {
    console.error(`
⚠️  海外平台自动化需要您的确认

平台: ${platform}
操作: ${action}

请在终端执行：
  $env:OVERSEAS_ALLOW_AUTOMATION="true"   # PowerShell
  export OVERSEAS_ALLOW_AUTOMATION=true  # bash
`);
    process.exit(1);
  }
}

/** Agent 默认不自动开浏览器；用户显式 npm run x:login 时由脚本设 OVERSEAS_USER_REQUESTED_BROWSER=true */
export function mayLaunchBrowser(_platform) {
  return process.env.OVERSEAS_USER_REQUESTED_BROWSER === 'true';
}

export function printManualLoginSteps(platform, url) {
  console.log(`请手动打开 Chrome 并访问: ${url}`);
  console.log(`平台: ${platform} — 登录完成后回到终端按 Enter。`);
}
