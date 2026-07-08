#!/usr/bin/env node
/**
 * X 填稿预览 — 打开 composer、输入内容，不点击 Post（submit: false / dryRun）。
 */
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { signalFireRoot } from './lib/signal-fire.mjs';
import { requireOverseasConsent } from './lib/overseas-guard.mjs';

requireOverseasConsent('x', 'publish-draft');

function parseArgs(argv) {
  const opts = { account: process.env.SIGNAL_FIRE_ACCOUNT_ID || 'default', text: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i] ?? '';
    else if (a === '--account') opts.account = argv[++i] ?? opts.account;
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.text.trim()) {
  console.error('用法: npm run signal-fire:x-draft -- --text "你的推文内容"');
  process.exit(1);
}

const root = resolve(signalFireRoot());
if (!existsSync(join(root, 'dist/platforms/x/index.js'))) {
  console.error('signal-fire 未安装。请先: npm run signal-fire:install');
  process.exit(1);
}

const { post } = await import(pathToFileURL(join(root, 'dist/platforms/x/index.js')).href);

console.log('=== signal-fire X 填稿（不发布）===');
console.log(`账号: ${opts.account}`);
console.log(`内容: ${opts.text}\n`);

const result = await post(
  { text: opts.text },
  { accountId: opts.account, submit: false },
);

if (result.ok) {
  console.log(`✅ ${result.detail ?? '已填稿，请在浏览器中确认后手动点击 Post'}`);
  console.log('浏览器窗口保持打开，请自行审阅后决定是否发布。');
  process.exit(0);
}

console.error(`❌ 填稿失败: ${result.error ?? 'unknown'}`);
if (result.debugArtifacts) {
  console.error('调试产物:', result.debugArtifacts);
}
process.exit(2);
