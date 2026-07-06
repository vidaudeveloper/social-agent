#!/usr/bin/env node
/**
 * social-auto-upload (sau) CLI 封装
 */
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const DEFAULT_SAU_ROOT = './tool/social-auto-upload';

export function sauRoot() {
  return (process.env.SAU_ROOT || DEFAULT_SAU_ROOT).replace(/\\/g, '/');
}

export function sauAvailable() {
  return existsSync(join(sauRoot(), 'sau_cli.py'));
}

export function sauAccount(platform) {
  const envKey = `${platform.toUpperCase()}_ACCOUNT_ID`;
  return process.env[envKey] || 'default';
}

export function runSau(args) {
  const root = sauRoot();
  if (!sauAvailable()) {
    console.error(`social-auto-upload 未安装: ${root}`);
    console.error('请先执行: npm run overseas:install');
    process.exit(1);
  }

  const pyCode = `import sys
sys.path.insert(0, '${root}')
from sau_cli import main
sys.argv = ['sau'] + ${JSON.stringify(args)}
try:
    main()
except SystemExit:
    pass`;

  const tmpFile = `${process.env.TEMP || '/tmp'}/social-agent-sau-run.py`.replace(/\\/g, '/');
  writeFileSync(tmpFile, pyCode, 'utf-8');
  execSync(`uv run --directory "${root}" python "${tmpFile}"`, { stdio: 'inherit', shell: true });
}
