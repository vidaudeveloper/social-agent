#!/usr/bin/env node
/**
 * X (Twitter) 发布 CLI — 封装 baoyu-post-to-x CDP 脚本
 * 上游: JimLiu/baoyu-skills/skills/baoyu-post-to-x
 */
import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';
import { runBaoyuScript, ensureBaoyuXInstalled } from '../../../scripts/lib/baoyu-x.mjs';
import {
  mayLaunchBrowser,
  printManualLoginSteps,
  requireOverseasConsent,
} from '../../../scripts/lib/overseas-guard.mjs';

function defaultBaoyuProfile() {
  if (process.env.X_BROWSER_PROFILE_DIR) {
    return process.env.X_BROWSER_PROFILE_DIR;
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'baoyu-skills', 'chrome-profile');
  }
  return join(homedir(), '.baoyu-skills', 'chrome-profile');
}

const DEFAULT_CHROME =
  process.env.X_BROWSER_CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const DEFAULT_PROFILE = defaultBaoyuProfile();

function parseArgs(argv) {
  const opts = { images: [], submit: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i];
    else if (a === '--file' || a === '-f') opts.file = argv[++i];
    else if (a === '--video' || a === '-v') opts.video = argv[++i];
    else if (a === '--image' || a === '-i') opts.images.push(argv[++i]);
    else if (a === '--cover') opts.cover = argv[++i];
    else if (a === '--title') opts.title = argv[++i];
    else if (a === '--submit') opts.submit = true;
    else if (a === '--profile') opts.profile = argv[++i];
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  opts.profile = opts.profile || DEFAULT_PROFILE;
  if (process.env.X_AUTO_SUBMIT === 'true') opts.submit = true;
  return opts;
}

function openChrome(url) {
  const chrome = existsSync(DEFAULT_CHROME)
    ? DEFAULT_CHROME
    : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  if (!existsSync(chrome)) {
    console.error('未找到 Chrome，请设置 X_BROWSER_CHROME_PATH');
    process.exit(1);
  }
  const args = [`--user-data-dir=${DEFAULT_PROFILE}`, url];
  const child = spawn(chrome, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

async function cmdLogin() {
  requireOverseasConsent('x', 'login');
  ensureBaoyuXInstalled();
  console.log(`Chrome 配置目录: ${DEFAULT_PROFILE}\n`);
  if (mayLaunchBrowser('x')) {
    openChrome('https://x.com/i/flow/login');
    console.log('已按你的要求打开 Chrome 登录页。');
  } else {
    printManualLoginSteps('x', 'https://x.com/i/flow/login');
    console.log('\n本命令默认不自动打开浏览器。若确需脚本打开：');
    console.log('  $env:OVERSEAS_USER_REQUESTED_BROWSER="true"');
  }
  console.log('\n登录完成后按 Enter...');
  await new Promise((r) => process.stdin.once('data', r));
  console.log('✅ 请在 publish 时于浏览器确认发帖');
}

async function cmdCheckLogin() {
  requireOverseasConsent('x', 'check-login');
  const check = runBaoyuScript('check-paste-permissions.ts', [], {
    silent: true,
    allowFail: true,
  });
  const out = `${check.stdout || ''}${check.stderr || ''}`;
  const loggedInHint = out.includes('Chrome') && !out.includes('Cannot run bun');
  console.log(
    JSON.stringify(
      {
        ok: check.status === 0,
        envReady: check.status === 0,
        loggedIn: 'unknown — 请执行 x:login 或在 publish 时于浏览器确认',
        profileDir: DEFAULT_PROFILE,
      },
      null,
      2,
    ),
  );
  process.exit(loggedInHint && check.status === 0 ? 0 : 1);
}

function readContent(file) {
  if (!existsSync(file)) {
    console.error('文件不存在:', file);
    process.exit(1);
  }
  return readFileSync(file, 'utf8').trim();
}

async function cmdPublish(argv) {
  requireOverseasConsent('x', 'publish');
  const opts = parseArgs(argv);
  let { text, file, video, images, cover, title, submit, profile } = opts;

  if (file) {
    const lower = file.toLowerCase();
    if (lower.endsWith('.md')) {
      const args = [file];
      if (cover) args.push('--cover', cover);
      if (title) args.push('--title', title);
      if (submit) args.push('--submit');
      if (profile) args.push('--profile', profile);
      console.log('[x-skills] X Article 模式 (baoyu x-article.ts)');
      runBaoyuScript('x-article.ts', args);
      return;
    }
    text = readContent(file);
  }

  if (video) {
    const args = [];
    if (text) args.push(text);
    args.push('--video', video);
    if (submit) args.push('--submit');
    if (profile) args.push('--profile', profile);
    console.log('[x-skills] 视频帖模式 (baoyu x-video.ts)');
    runBaoyuScript('x-video.ts', args);
    return;
  }

  if (!text && images.length === 0) {
    console.error('用法: publish --text "..." | --file post.md | --video clip.mp4 [--image img.jpg]');
    process.exit(1);
  }

  const args = [];
  if (text) args.push(text);
  for (const img of images) args.push('--image', img);
  if (submit) args.push('--submit');
  if (profile) args.push('--profile', profile);

  console.log('[x-skills] 常规帖模式 (baoyu x-browser.ts)');
  console.log('提示: 默认仅填稿预览，需手动点 Post；加 --submit 可自动发布');
  runBaoyuScript('x-browser.ts', args);
}

async function cmdPreflight() {
  runBaoyuScript('check-paste-permissions.ts', []);
}

const [command, ...rest] = process.argv.slice(2);
const handlers = {
  login: cmdLogin,
  'check-login': cmdCheckLogin,
  publish: () => cmdPublish(rest),
  preflight: cmdPreflight,
};

if (!handlers[command]) {
  console.log(`X (Twitter) CLI — 基于 baoyu-post-to-x

  login              打开 Chrome 登录 X
  check-login        环境与会话检查
  preflight          运行 baoyu 环境自检
  publish --text "…" 发常规帖（文本/图片）
  publish --file x.md 发 X Article（需 Premium）
  publish --video f.mp4 --text "…" 发视频帖

npm: x:login | x:publish | x:check-login`);
  process.exit(command ? 1 : 0);
}

await handlers[command]();
