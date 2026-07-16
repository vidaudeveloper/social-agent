#!/usr/bin/env node
/**
 * YouTube Analytics CLI 包装 — Bin-Huang/youtube-analytics-cli
 *
 * 凭据从 Hermes/.env 或 profile .env 注入（不打印密钥）。
 * 本地 CLI：tool/youtube-analytics-cli；缺失时提示 npm run youtube:stats-setup。
 */
import { execSync, spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { ensureDeps } from './lib/ensure-deps.mjs';
import { runArchive } from '../skills/analytics/yt-post-analytics/scripts/archive.mjs';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliRoot = resolve(
  process.env.YOUTUBE_ANALYTICS_CLI_ROOT || join(profileRoot, 'tool', 'youtube-analytics-cli'),
);
const cliEntry = join(cliRoot, 'node_modules', 'youtube-analytics-cli', 'dist', 'index.js');

const PLACEHOLDER_VALUES = new Set([
  'your_api_key',
  'YOUR_API_KEY',
  'your_client_id',
  'YOUR_CLIENT_ID',
  'your_client_secret',
  'YOUR_CLIENT_SECRET',
  'your_refresh_token',
  'YOUR_REFRESH_TOKEN',
  '',
]);

function loadEnvFile(filePath, override = false) {
  if (!existsSync(filePath)) return;
  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (!override && process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
}

function resolveHermesEnvPath() {
  if (process.env.HERMES_ENV_PATH?.trim()) {
    return process.env.HERMES_ENV_PATH.trim();
  }
  try {
    const out = execSync('hermes config env-path', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out && existsSync(out)) return out;
  } catch {
    // hermes CLI not available
  }
  return null;
}

function loadYoutubeEnv() {
  const candidates = [
    resolveHermesEnvPath(),
    join(profileRoot, '.env'),
    join(cliRoot, '.env'),
  ].filter(Boolean);
  for (const p of candidates) {
    loadEnvFile(p);
  }
}

function isConfiguredSecret(value) {
  const v = value?.trim();
  return Boolean(v) && !PLACEHOLDER_VALUES.has(v);
}

loadYoutubeEnv();

function printUsage() {
  console.log(`YouTube Analytics（youtube-analytics-cli 包装）

用法:
  npm run youtube:stats -- <youtube-analytics-cli 子命令与参数>
  npm run youtube:stats -- archive [--days 30] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]

常用:
  npm run youtube:stats -- archive
  npm run youtube:stats -- videos <videoId>
  npm run youtube:stats -- channels <channelId>
  npm run youtube:stats -- channels
  npm run youtube:stats -- report --metrics views,likes --start-date YYYY-MM-DD --end-date YYYY-MM-DD --dimensions day

archive 会拉取自家频道 + Analytics，落盘 HTML/JSON 到:
  $HERMES_ROOT/知识库/youtube/发布复盘/{channelSlug}/{date}_作品复盘.html

安装: npm run youtube:stats-setup
文档: skills/analytics/yt-post-analytics/
凭据: YOUTUBE_API_KEY（公开数据）；报表需 OAuth 见 references/setup.md`);
}

function ensureCredentialsForArgs(args) {
  const cmd = args[0] || '';
  const needsOauth =
    cmd === 'report' ||
    cmd === 'groups' ||
    cmd === 'group-items' ||
    (cmd === 'channels' && !args[1]);

  const hasApiKey = isConfiguredSecret(process.env.YOUTUBE_API_KEY);
  const hasOauth =
    isConfiguredSecret(process.env.YOUTUBE_CLIENT_ID) &&
    isConfiguredSecret(process.env.YOUTUBE_CLIENT_SECRET) &&
    isConfiguredSecret(process.env.YOUTUBE_REFRESH_TOKEN);

  if (needsOauth && !hasOauth) {
    console.error(
      '[error] 该命令需要 OAuth：请在 .env 配置 YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN',
    );
    console.error('见 skills/analytics/yt-post-analytics/references/setup.md');
    process.exit(2);
  }
  if (!needsOauth && !hasApiKey && !hasOauth) {
    console.error('[error] 需要 YOUTUBE_API_KEY（或完整 OAuth）。见 .env.EXAMPLE');
    process.exit(2);
  }
}

function runCli(args) {
  if (!existsSync(cliEntry)) {
    console.error(`youtube-analytics-cli 未找到: ${cliEntry}`);
    console.error('请先执行: npm run youtube:stats-setup');
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [cliEntry, ...args], {
    stdio: 'inherit',
    env: process.env,
    cwd: profileRoot,
  });
  process.exit(r.status ?? 1);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  printUsage();
  process.exit(0);
}

ensureDeps(['youtube-analytics']);

if (args[0] === 'archive') {
  ensureCredentialsForArgs(['channels']);
  try {
    runArchive(args.slice(1));
  } catch (e) {
    console.error('[archive]', e instanceof Error ? e.message : e);
    process.exit(1);
  }
  process.exit(0);
}

ensureCredentialsForArgs(args);
runCli(args);
