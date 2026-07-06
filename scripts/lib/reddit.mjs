#!/usr/bin/env node
/**
 * reddit-skills (1146345502) CLI 封装
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function redditRoot() {
  const raw = process.env.REDDIT_ROOT || join(profileRoot, 'tool', 'reddit-skills');
  return raw.replace(/\\/g, '/');
}

export function redditAvailable() {
  return existsSync(join(redditRoot(), 'scripts', 'cli.py'));
}

export function runRedditCli(args) {
  const root = redditRoot();
  if (!redditAvailable()) {
    console.error(`reddit-skills 未安装: ${root}`);
    console.error('请先执行: npm run reddit:setup');
    process.exit(1);
  }

  const cliPath = join(root, 'scripts', 'cli.py').replace(/\\/g, '/');
  const quoted = args.map((a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
  execSync(`uv run --directory "${root}" python "${cliPath}" ${quoted}`, {
    stdio: 'inherit',
    shell: true,
    cwd: profileRoot,
  });
}
