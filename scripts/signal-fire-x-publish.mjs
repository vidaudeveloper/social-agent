#!/usr/bin/env node
/**
 * signal-fire X 填稿 — 单浏览器会话：必要时登录一次 → 填稿 → 保持浏览器打开
 */
import { createInterface } from 'readline';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { signalFireRoot } from './lib/signal-fire.mjs';
import { requireOverseasConsent } from './lib/overseas-guard.mjs';

requireOverseasConsent('x', 'publish-draft');

function parseArgs(argv) {
  const opts = {
    account: process.env.SIGNAL_FIRE_ACCOUNT_ID || 'default',
    text: '',
    submit: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i] ?? '';
    else if (a === '--account') opts.account = argv[++i] ?? opts.account;
    else if (a === '--submit') opts.submit = true;
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  return opts;
}

function waitForEnter(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.text.trim()) {
  console.error('用法: npm run signal-fire:x-publish -- --text "你的推文内容"');
  process.exit(1);
}

const root = resolve(signalFireRoot());
if (!existsSync(join(root, 'dist/platforms/x/index.js'))) {
  console.error('signal-fire 未安装。请先 clone/build tool/signal-fire');
  process.exit(1);
}

const importFrom = (rel) => import(pathToFileURL(join(root, rel)).href);
const { launchBrowser } = await importFrom('dist/core/browser.js');
const { markUserDataDirValidated } = await importFrom('dist/core/session.js');
const { isLoggedIn } = await importFrom('dist/platforms/x/auth.js');
const { post } = await importFrom('dist/platforms/x/index.js');

console.log('=== signal-fire X 发布测试 ===');
console.log(`账号: ${opts.account}`);
console.log(`模式: ${opts.submit ? '自动点击 Post' : '仅填稿（不发布）'}`);
console.log(`内容: ${opts.text}`);
console.log('浏览器将在结束后保持打开。\n');

const { context } = await launchBrowser({ accountId: opts.account, platform: 'x' });
const page = context.pages()[0] ?? (await context.newPage());

let loggedIn = await isLoggedIn(page);
if (!loggedIn) {
  console.log('未检测到登录态。将打开 X 登录页（只打开一次，不会轮询刷新）。');
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded' });
  console.log('请在浏览器中完成登录（含 2FA），看到首页时间线后回到终端。');
  await waitForEnter('登录完成后按 Enter 继续…\n');
  loggedIn = await isLoggedIn(page);
  if (!loggedIn) {
    console.error('仍未检测到登录态。浏览器保持打开，请确认登录后重试。');
    process.exit(1);
  }
  await markUserDataDirValidated('x', opts.account);
  console.log('✅ 登录态已确认\n');
}

const result = await post(
  { text: opts.text },
  { accountId: opts.account, submit: opts.submit, sharedContext: context },
);

if (result.ok) {
  console.log(`✅ ${result.detail ?? result.url ?? '完成'}`);
  console.log('浏览器保持打开，请自行审阅。');
  process.exit(0);
}

console.error(`❌ 失败: ${result.error ?? 'unknown'}`);
if (result.debugArtifacts) console.error('调试产物:', result.debugArtifacts);
console.log('浏览器保持打开，便于排查。');
process.exit(2);
