#!/usr/bin/env node
/**
 * X 登录 — 打开 Chrome 到登录页一次，用户手动登录后按 Enter 确认。
 * 禁止轮询 isLoggedIn（该函数会 goto home，会打断登录页输入）。
 */
import { createInterface } from 'readline';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { signalFireRoot } from './lib/signal-fire.mjs';
import { requireOverseasConsent } from './lib/overseas-guard.mjs';

requireOverseasConsent('x', 'login');

const account = process.env.SIGNAL_FIRE_ACCOUNT_ID || process.env.X_ACCOUNT_ID || 'default';

const root = resolve(signalFireRoot());
const importFrom = (rel) => import(pathToFileURL(join(root, rel)).href);

const launchBrowser = (await importFrom('dist/core/browser.js')).launchBrowser;
const { markUserDataDirValidated, getSessionPaths } = await importFrom('dist/core/session.js');
const { isLoggedIn } = await importFrom('dist/platforms/x/auth.js');

if (!existsSync(join(root, 'dist/cli/index.js'))) {
  console.error('signal-fire 未安装。请先: npm run signal-fire:install');
  process.exit(1);
}

console.log('=== signal-fire X 登录（手动）===');
console.log(`账号: ${account}`);
console.log('');
console.log('1. 将打开 Chrome 到 X 登录页（只打开一次，不会自动刷新）');
console.log('2. 请在浏览器中手动完成登录（含 2FA）');
console.log('3. 看到首页时间线后，回到本终端按 Enter 保存 session');
console.log('');

const { context, close } = await launchBrowser({ accountId: account, platform: 'x' });
try {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded' });

  console.log('浏览器已打开。完成登录后按 Enter…');
  await new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });

  // 仅验证一次（会导航到 home 检查 cookie/DOM）
  const loggedIn = await isLoggedIn(page);
  if (!loggedIn) {
    console.error('未检测到登录态。请确认已在浏览器看到 X 首页时间线，然后重试。');
    process.exit(1);
  }

  await markUserDataDirValidated('x', account);
  const paths = getSessionPaths('x', account);
  console.log(`✅ X 登录成功，profile 已保存: ${paths.userDataDir}`);
} finally {
  await close();
}
