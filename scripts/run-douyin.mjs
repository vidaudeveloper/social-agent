#!/usr/bin/env node
/**
 * 抖音 SAU CLI — login / check / upload
 * 上游: tool/social-auto-upload（系统 Chrome，cookie 在项目 cookies/ 目录）
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sauRoot = resolve(profileRoot, (process.env.SAU_ROOT || 'tool/social-auto-upload').replace(/\\/g, '/'));
const account = process.env.DOUYIN_ACCOUNT || process.env.SAU_ACCOUNT || 'default';

const args = process.argv.slice(2);

function sauEnv() {
  const chrome =
    process.env.SAU_CHROME_PATH ||
    process.env.LOCAL_CHROME_PATH ||
    (process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : '');
  return {
    ...process.env,
    SAU_ROOT: sauRoot,
    PYTHONIOENCODING: 'utf-8',
    ...(chrome && existsSync(chrome) ? { SAU_CHROME_PATH: chrome } : {}),
  };
}

function quoteArg(arg) {
  const s = String(arg);
  if (process.platform === 'win32') {
    if (/[\s"#&|^<>]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }
  if (/[\s'\\]/.test(s)) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

function runSau(sauArgs) {
  const cmd = ['uv', 'run', 'sau', 'douyin', ...sauArgs].map(quoteArg).join(' ');
  const result = spawnSync(cmd, {
    cwd: sauRoot,
    stdio: 'inherit',
    shell: true,
    env: sauEnv(),
  });
  process.exit(result.status ?? 1);
}

if (!args.length || args[0] === '--help' || args[0] === '-h') {
  console.log(`抖音 SAU CLI

  login                     扫码登录（仅一次，勿重复执行）
  check                     只读 cookie 文件校验（不打开浏览器）
  check --online            浏览器验证 cookie（可选）
  upload --video <mp4>      上传视频（--title 必填）

npm: douyin:login | douyin:check | douyin:upload

前置: npm run overseas:install（SAU + 系统 Chrome）
Cookie: tool/social-auto-upload/cookies/douyin_<account>.json

示例:
  npm run douyin:login
  npm run douyin:check
  npm run douyin:upload -- --video "D:/path/video.mp4" --title "标题"`);
  process.exit(0);
}

const cmd = args[0];

if (cmd === 'login') {
  console.log('[douyin] 扫码登录 — 请在弹出的 Chrome 窗口完成登录，勿重复执行 login');
  runSau(['login', '--account', account, '--headed']);
}

if (cmd === 'check') {
  const online = args.includes('--online');
  const sauArgs = ['check', '--account', account];
  if (online) sauArgs.push('--online', '--headed');
  runSau(sauArgs);
}

if (cmd === 'upload') {
  const rest = args.slice(1);
  const videoIdx = rest.findIndex((a) => a === '--video' || a === '--file');
  const titleIdx = rest.findIndex((a) => a === '--title');
  if (videoIdx < 0 || !rest[videoIdx + 1]) {
    console.error('缺少 --video <mp4绝对路径>');
    process.exit(1);
  }
  if (titleIdx < 0 || !rest[titleIdx + 1]) {
    console.error('缺少 --title "标题"');
    process.exit(1);
  }
  const mapped = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--video') {
      mapped.push('--file', rest[++i]);
    } else {
      mapped.push(rest[i]);
    }
  }
  console.log('[douyin] 上传 — 仅开一个 Chrome；出现验证码时请手动完成');
  runSau(['upload-video', '--account', account, '--headed', ...mapped]);
}

console.error(`未知命令: ${cmd}`);
process.exit(1);
