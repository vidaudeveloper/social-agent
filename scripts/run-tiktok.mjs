#!/usr/bin/env node
/**
 * TikTok CLI 包装 — 使用 SAU_ROOT 的 uv 虚拟环境，避免裸 python 缺 playwright。
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sauRoot = (process.env.SAU_ROOT || './tool/social-auto-upload').replace(/\\/g, '/');
const cliPath = join(profileRoot, 'skills/social-media/tiktok/scripts/cli.py').replace(/\\/g, '/');
const args = process.argv.slice(2);

if (!existsSync(join(sauRoot, 'sau_cli.py'))) {
  console.error(`social-auto-upload 未找到: ${sauRoot}`);
  console.error('请先执行: npm run overseas:install');
  process.exit(1);
}

if (args.length === 0) {
  console.log(`用法: node scripts/run-tiktok.mjs <login|check-login|publish> [选项]
环境: SAU_ROOT=${sauRoot}`);
  process.exit(0);
}

const quotedArgs = args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
const cmd = `uv run --directory "${sauRoot}" python "${cliPath}" ${quotedArgs}`;

execSync(cmd, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SAU_ROOT: sauRoot },
});
