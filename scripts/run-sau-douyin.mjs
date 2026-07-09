#!/usr/bin/env node
/**
 * 抖音 SAU CLI 包装 — login / check / upload-video
 * 上游: tool/social-auto-upload (sau douyin)
 * 默认使用系统 Chrome（conf.LOCAL_CHROME_PATH），不依赖额外 Playwright Chromium 下载。
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
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
  console.log(`抖音 SAU CLI（social-auto-upload）

  login                     扫码登录，cookie 存 tool/social-auto-upload/cookies/douyin_<account>.json
  check                     校验 cookie
  upload --video <mp4>      上传视频（--title 必填）

npm: douyin:sau-login | douyin:sau-check | douyin:sau-upload

账号: ${account}（DOUYIN_ACCOUNT / SAU_ACCOUNT 可覆盖）
SAU_ROOT: ${sauRoot}

示例:
  npm run douyin:sau-login
  npm run douyin:sau-upload -- --video "D:/path/video.mp4" --title "标题"`);
  process.exit(0);
}

const cmd = args[0];

if (cmd === 'login') {
  console.log('[douyin:sau] 扫码登录 — 请在弹出的 Chrome 窗口完成登录');
  runSau(['login', '--account', account, '--headed']);
}

if (cmd === 'check') {
  runSau(['check', '--account', account]);
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
  const sauArgs = ['upload-video', '--account', account, '--headed', ...mapped];
  console.log('[douyin:sau] 上传 — 出现验证码时请手动完成，不要关闭浏览器');
  runSau(sauArgs);
}

console.error(`未知命令: ${cmd}`);
process.exit(1);
