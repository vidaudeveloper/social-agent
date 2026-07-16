#!/usr/bin/env node
/**
 * 平台依赖 marker 检查（hint-only，不自动安装）
 */
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { baoyuXScriptsDir } from './baoyu-x.mjs';

// scripts/lib → profile root（必须用 dirname，否则 join(文件路径, '../..') 会停在 scripts/）
const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {Record<string, { label: string, check: () => boolean, fix: string }>} */
export const DEP_CHECKS = {
  'xhs-card': {
    label: '小红书卡片 (Auto-Redbook)',
    check: () =>
      existsSync(
        join(
          profileRoot,
          (process.env.AUTO_REDBOOK_ROOT || 'tool/Auto-Redbook-Skills').replace(/\\/g, '/'),
          'scripts/render_xhs.py',
        ),
      ),
    fix: 'npm run tool:install',
  },
  youtube: {
    label: 'YouTube / TikTok (social-auto-upload)',
    check: () =>
      existsSync(
        join(
          profileRoot,
          (process.env.SAU_ROOT || 'tool/social-auto-upload').replace(/\\/g, '/'),
          'sau_cli.py',
        ),
      ),
    fix: 'npm run overseas:install',
  },
  tiktok: {
    label: 'TikTok (social-auto-upload)',
    check: () => DEP_CHECKS.youtube.check(),
    fix: 'npm run overseas:install',
  },
  x: {
    label: 'X (baoyu-post-to-x)',
    check: () => existsSync(join(baoyuXScriptsDir(), 'x-browser.ts')),
    fix: 'npm run x:setup',
  },
  reddit: {
    label: 'Reddit (rd-skills / 上游 tool/reddit-skills)',
    check: () =>
      existsSync(
        join(
          profileRoot,
          (process.env.REDDIT_ROOT || 'tool/reddit-skills').replace(/\\/g, '/'),
          'scripts/cli.py',
        ),
      ),
    fix: 'npm run reddit:setup',
  },
  linkedin: {
    label: 'LinkedIn (linkedin-cli)',
    check: () =>
      existsSync(
        join(
          profileRoot,
          (process.env.LINKEDIN_CLI_ROOT || 'tool/linkedin-cli').replace(/\\/g, '/'),
          'dist/cli.js',
        ),
      ),
    fix: 'npm run linkedin:setup',
  },
  zhihu: {
    label: '知乎 (pyzhihu-cli)',
    check: () => {
      const cmd = process.platform === 'win32' ? 'where' : 'which';
      const r = spawnSync(cmd, ['zhihu'], { encoding: 'utf8', shell: true });
      return r.status === 0;
    },
    fix: 'uv tool install pyzhihu-cli',
  },
  douyin: {
    label: '抖音 (SAU + overseas:install)',
    check: () => existsSync(join(profileRoot, 'tool/social-auto-upload/sau_cli.py')),
    fix: 'npm run overseas:install',
  },
  'youtube-explore': {
    label: 'YouTube explore (transcript-api + TubePilot MCP)',
    check: () => {
      const r = spawnSync(
        'uv',
        ['run', '--with', 'youtube-transcript-api', 'python', '-c', 'import youtube_transcript_api'],
        { encoding: 'utf8', shell: true },
      );
      return r.status === 0;
    },
    fix: 'uv pip install youtube-transcript-api；TubePilot 见 workspace/references/youtube-explore-setup.md',
  },
  'youtube-analytics': {
    label: 'YouTube Analytics (youtube-analytics-cli)',
    check: () =>
      existsSync(
        join(
          profileRoot,
          (process.env.YOUTUBE_ANALYTICS_CLI_ROOT || 'tool/youtube-analytics-cli').replace(/\\/g, '/'),
          'node_modules/youtube-analytics-cli/dist/index.js',
        ),
      ),
    fix: 'npm run youtube:stats-setup',
  },
};

/**
 * @param {string[]} platforms
 * @returns {{ ok: boolean, missing: Array<{ platform: string, label: string, fix: string }> }}
 */
export function checkDeps(platforms) {
  const missing = [];
  for (const platform of platforms) {
    const key = platform.trim().toLowerCase();
    const entry = DEP_CHECKS[key];
    if (!entry) {
      missing.push({ platform: key, label: `(未知平台 ${key})`, fix: '见 workspace/references/dependency-policy.md' });
      continue;
    }
    if (!entry.check()) {
      missing.push({ platform: key, label: entry.label, fix: entry.fix });
    }
  }
  return { ok: missing.length === 0, missing };
}

/**
 * @param {string[]} platforms
 * @param {{ exitOnFail?: boolean }} [opts]
 * @returns {boolean}
 */
export function ensureDeps(platforms, opts = {}) {
  const { exitOnFail = true } = opts;
  const { ok, missing } = checkDeps(platforms);
  if (ok) return true;

  for (const m of missing) {
    console.error(`[MISSING] platform=${m.platform} label=${m.label}`);
    console.error(`fix: ${m.fix}`);
  }
  console.error('详见: workspace/references/dependency-policy.md');

  if (exitOnFail) process.exit(2);
  return false;
}
