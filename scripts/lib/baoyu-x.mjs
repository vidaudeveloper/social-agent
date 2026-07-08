#!/usr/bin/env node
/**
 * baoyu-post-to-x 脚本封装
 * 上游: tool/baoyu-skills/skills/baoyu-post-to-x/scripts/
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_BAOYU_ROOT = './tool/baoyu-skills';
const SKILL_SCRIPTS = 'skills/baoyu-post-to-x/scripts';

export function baoyuRoot() {
  const configured = (process.env.BAOYU_SKILLS_ROOT || '').replace(/\\/g, '/');
  if (configured) return configured;

  const primary = DEFAULT_BAOYU_ROOT.replace(/\\/g, '/');
  const vendor = './tool/baoyu-skills-vendor'.replace(/\\/g, '/');
  const primaryMarker = join(primary, SKILL_SCRIPTS, 'x-browser.ts');
  const vendorMarker = join(vendor, SKILL_SCRIPTS, 'x-browser.ts');
  if (!existsSync(primaryMarker) && existsSync(vendorMarker)) return vendor;
  return primary;
}

export function baoyuXScriptsDir() {
  return join(baoyuRoot(), SKILL_SCRIPTS);
}

export function ensureBaoyuXInstalled() {
  const dir = baoyuXScriptsDir();
  const marker = join(dir, 'x-browser.ts');
  if (!existsSync(marker)) {
    console.error(`baoyu-post-to-x 未安装: ${dir}`);
    console.error('请先执行: npm run x:setup');
    process.exit(1);
  }
}

function bunCommandParts() {
  if (process.env.BUN_PATH && existsSync(process.env.BUN_PATH)) {
    return [process.env.BUN_PATH];
  }
  const bunOnPath = spawnSync('bun', ['--version'], { encoding: 'utf8', shell: true });
  if (bunOnPath.status === 0) return ['bun'];
  return ['npx', '-y', 'bun'];
}

export function runBaoyuScript(scriptName, args = [], { silent = false, allowFail = false } = {}) {
  ensureBaoyuXInstalled();
  const scriptPath = join(baoyuXScriptsDir(), scriptName);
  if (!existsSync(scriptPath)) {
    console.error(`脚本不存在: ${scriptPath}`);
    process.exit(1);
  }

  const [runner, ...runnerPrefix] = bunCommandParts();
  const cmdArgs = [...runnerPrefix, scriptPath, ...args];

  const result = spawnSync(runner, cmdArgs, {
    stdio: silent ? 'pipe' : 'inherit',
    encoding: 'utf8',
    shell: runner === 'npx',
    env: { ...process.env, BAOYU_SKILLS_ROOT: baoyuRoot() },
  });

  if (!allowFail && (result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}
