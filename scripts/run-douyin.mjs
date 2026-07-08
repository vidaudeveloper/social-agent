#!/usr/bin/env node
/**
 * 抖音 PVA CLI 包装 — login / upload
 * 上游: @panda-video-automation/pva
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';

const DEFAULT_PLAYWRIGHT_BROWSERS = 'D:/test/tool/playwright-browsers';

function playwrightEnv() {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || DEFAULT_PLAYWRIGHT_BROWSERS;
  const headlessShell = `${browsersPath.replace(/\\/g, '/')}/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe`;
  if (!existsSync(headlessShell)) {
    console.error(`Playwright 浏览器未安装: ${browsersPath}`);
    console.error('请先执行: npm run douyin:setup');
    process.exit(2);
  }
  return {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: browsersPath,
    PVA_HEADLESS: process.env.PVA_HEADLESS ?? 'false',
  };
}
const args = process.argv.slice(2);
const cmd = args[0];

function quoteArg(arg) {
  const s = String(arg);
  if (process.platform === 'win32') {
    if (/[\s"#&|^<>]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }
  if (/[\s'\\]/.test(s)) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

function runPva(pvaArgs) {
  const cmd = ['npx', '-y', '@panda-video-automation/pva', ...pvaArgs].map(quoteArg).join(' ');
  const result = spawnSync(cmd, {
    stdio: 'inherit',
    shell: true,
    env: playwrightEnv(),
  });
  process.exit(result.status ?? 1);
}

if (!cmd || cmd === '--help' || cmd === '-h') {
  console.log(`抖音 PVA CLI

  login                     打开 Chrome 登录抖音创作者中心
  upload --video <mp4>      上传视频（--title / --desc / --tags / --cover）

npm: douyin:login | douyin:upload

示例:
  npm run douyin:upload -- --video "D:/path/video.mp4" --title "标题 #话题"`);
  process.exit(0);
}

if (cmd === 'login') {
  console.log('[douyin] PVA 登录 — 请在浏览器中完成抖音创作者中心登录');
  runPva(['douyin', 'login']);
}

if (cmd === 'upload') {
  const rest = args.slice(1);
  if (!rest.some((a, i) => a === '--video' && rest[i + 1])) {
    console.error('缺少 --video <mp4绝对路径>');
    process.exit(1);
  }
  console.log('[douyin] PVA 上传 — 浏览器保持打开，请在页面确认后发布');
  runPva(['douyin', 'upload', ...rest]);
}

console.error(`未知命令: ${cmd}`);
process.exit(1);
