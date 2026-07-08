#!/usr/bin/env node
/**
 * X (baoyu-post-to-x) CLI 包装
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = join(profileRoot, 'skills/social-media/x/scripts/cli.mjs');
const args = process.argv.slice(2);

if (!existsSync(cliPath)) {
  console.error(`X CLI 未找到: ${cliPath}`);
  process.exit(1);
}

const env = { ...process.env };
const cmd = args[0];

// 默认操作后保持 Chrome 打开，避免频繁启停触发风控
if (env.X_CLOSE_BROWSER == null) {
  env.X_CLOSE_BROWSER = 'false';
}

// login：只打开一次登录页，不轮询刷新
if (cmd === 'login') {
  env.OVERSEAS_USER_REQUESTED_BROWSER = 'true';
}

const result = spawnSync(process.execPath, [cliPath, ...args], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
