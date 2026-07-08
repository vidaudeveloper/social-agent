#!/usr/bin/env node
/**
 * douyin:setup — 按平台调用 Playwright 安装脚本
 */
import { spawnSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (process.platform === 'win32') {
  const ps1 = join(profileRoot, 'scripts/install-douyin-playwright.ps1');
  const r = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1],
    { stdio: 'inherit', cwd: profileRoot },
  );
  process.exit(r.status ?? 1);
}

const sh = join(profileRoot, 'scripts/install-douyin-playwright.sh');
const r = spawnSync('bash', [sh], { stdio: 'inherit', cwd: profileRoot });
process.exit(r.status ?? 1);
