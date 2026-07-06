#!/usr/bin/env node
/**
 * LinkedIn CLI 包装 — 使用 gxbvc/linkedin-cli（官方 OAuth + Posts API）
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { requireOverseasConsent } from './lib/overseas-guard.mjs';
import { waitForUserConfirm } from './lib/user-confirm.mjs';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliRoot = resolve(
  process.env.LINKEDIN_CLI_ROOT || join(profileRoot, 'tool', 'linkedin-cli')
);
const linkedinBin = join(cliRoot, 'bin', 'linkedin.js');

const PLACEHOLDER_VALUES = new Set(['your_client_id', 'your_client_secret', '']);

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
    const out = execSync('hermes config env-path', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (out && existsSync(out)) return out;
  } catch {
    // hermes CLI not available
  }
  return null;
}

function loadLinkedInEnv() {
  const candidates = [
    resolveHermesEnvPath(),
    join(profileRoot, '.env'),
    join(cliRoot, '.env'),
  ].filter(Boolean);
  for (const p of candidates) {
    loadEnvFile(p);
  }
}

loadLinkedInEnv();

function isConfiguredSecret(value) {
  const v = value?.trim();
  return Boolean(v) && !PLACEHOLDER_VALUES.has(v);
}

function runLinkedIn(args, options = {}) {
  if (!existsSync(linkedinBin)) {
    console.error(`linkedin-cli 未找到: ${cliRoot}`);
    console.error('请先执行: npm run linkedin:setup');
    process.exit(1);
  }
  const quoted = args.map((a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
  const cmd = `node "${linkedinBin}" ${quoted}`;
  if (options.inherit) {
    execSync(cmd, { stdio: 'inherit', shell: true, env: process.env, cwd: cliRoot });
    return '';
  }
  return execSync(cmd, { encoding: 'utf8', shell: true, env: process.env, cwd: cliRoot });
}

function parsePublishArgs(argv) {
  const opts = { visibility: 'public' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i];
    else if (a === '--file' || a === '-f') opts.file = argv[++i];
    else if (a === '--visibility') opts.visibility = argv[++i];
    else if (a === '--image') opts.image = argv[++i];
    else if (a === '--link') opts.link = argv[++i];
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  opts.text = process.env.LINKEDIN_POST_TEXT || opts.text || '';
  return opts;
}

function ensureCredentials() {
  if (!isConfiguredSecret(process.env.LINKEDIN_CLIENT_ID) || !isConfiguredSecret(process.env.LINKEDIN_CLIENT_SECRET)) {
    console.error('缺少 LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET（或仍为占位符 your_client_id）。');
    console.error('请在 Hermes .env 或 tool/linkedin-cli/.env 配置（见 skills/social-media/linkedin/references/linkedin-api-setup.md）');
    process.exit(1);
  }
}

async function cmdLogin() {
  requireOverseasConsent('linkedin', 'login');
  ensureCredentials();
  console.log('\n=== LinkedIn OAuth（gxbvc/linkedin-cli）===\n');
  console.log('Redirect URL 须在 LinkedIn 应用中配置: http://localhost:3457/callback\n');
  await waitForUserConfirm('按 Enter 后打开浏览器，请手动登录并授权');
  runLinkedIn(['auth'], { inherit: true });
  console.log('\n保存 person ID…');
  runLinkedIn(['profile', '--save'], { inherit: true });
  console.log('\n✅ 授权完成。下一步: npm run linkedin:check-login');
}

async function cmdCheckLogin() {
  requireOverseasConsent('linkedin', 'check-login');
  ensureCredentials();
  await waitForUserConfirm('将检查令牌状态与个人资料（各一次 API）。确认后按 Enter');
  runLinkedIn(['auth', 'status'], { inherit: true });
  runLinkedIn(['profile'], { inherit: true });
}

async function cmdPublish(argv) {
  requireOverseasConsent('linkedin', 'publish');
  ensureCredentials();
  const { text, file, visibility, image, link } = parsePublishArgs(argv);
  let content = text;
  if (file) {
    if (!existsSync(file)) {
      console.error('文件不存在:', file);
      process.exit(1);
    }
    content = readFileSync(file, 'utf8');
  }
  if (!content.trim()) {
    console.error('用法: publish --text "..." | --file article.md [--visibility public|connections] [--image path] [--link url]');
    process.exit(1);
  }
  if (!['connections', 'public'].includes(visibility)) {
    console.error('--visibility 仅支持 public 或 connections');
    process.exit(1);
  }

  const preview = content.length > 120 ? `${content.slice(0, 120)}…` : content;
  console.log(`\n即将通过官方 Posts API 发布个人动态`);
  console.log(`可见性: ${visibility}`);
  console.log(`预览: ${preview}\n`);
  await waitForUserConfirm('确认内容无误后按 Enter 发布');

  const args = ['posts', 'create', '--text', content, '--visibility', visibility];
  if (image) args.push('--image', image);
  if (link) args.push('--link', link);
  runLinkedIn(args, { inherit: true });
}

async function cmdStats(argv) {
  requireOverseasConsent('linkedin', 'stats');
  ensureCredentials();
  const count = argv.includes('-n') ? argv[argv.indexOf('-n') + 1] : '10';
  runLinkedIn(['posts', 'list', '-n', count], { inherit: true });
}

const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.log(`LinkedIn（gxbvc/linkedin-cli 包装）

  login | check-login | publish | stats

  须 OVERSEAS_ALLOW_AUTOMATION=true
  安装: npm run linkedin:setup
  文档: skills/social-media/linkedin/references/linkedin-api-setup.md`);
  process.exit(0);
}

if (command === 'login') {
  await cmdLogin();
} else if (command === 'check-login') {
  await cmdCheckLogin();
} else if (command === 'publish') {
  await cmdPublish(rest);
} else if (command === 'stats') {
  await cmdStats(rest);
} else {
  console.error('未知命令:', command);
  process.exit(1);
}
