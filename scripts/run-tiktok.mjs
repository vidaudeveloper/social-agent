#!/usr/bin/env node
/**
 * TikTok CLI 包装 — 使用 SAU_ROOT 的 uv 虚拟环境，避免裸 python 缺 playwright。
 */
import { spawnSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { ensureDeps } from './lib/ensure-deps.mjs';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sauRoot = resolve(profileRoot, (process.env.SAU_ROOT || 'tool/social-auto-upload').replace(/\\/g, '/'));
const cliPath = join(profileRoot, 'skills/publish/tiktok/scripts/cli.py').replace(/\\/g, '/');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`用法: node scripts/run-tiktok.mjs <login|check-login|open-drafts|publish> [选项]
环境: SAU_ROOT=${sauRoot}`);
  process.exit(0);
}

ensureDeps(['tiktok']);

const quotedArgs = args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
const cmd = `uv run --directory "${sauRoot}" python "${cliPath}" ${quotedArgs}`;

const result = spawnSync(cmd, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SAU_ROOT: sauRoot, PYTHONIOENCODING: 'utf-8' },
});
process.exit(result.status ?? 1);
