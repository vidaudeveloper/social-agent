#!/usr/bin/env node
/**
 * X (baoyu-post-to-x) CLI 包装
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { ensureDeps } from './lib/ensure-deps.mjs';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = join(profileRoot, 'skills/publish/x/scripts/cli.mjs');
const args = process.argv.slice(2);

if (!existsSync(cliPath)) {
  console.error(`X CLI 未找到: ${cliPath}`);
  process.exit(1);
}

const cmd = args[0];
const needsBaoyu = ['login', 'check-login', 'preflight', 'publish'].includes(cmd);
if (needsBaoyu) {
  ensureDeps(['x']);
}

const env = { ...process.env };
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
