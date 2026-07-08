#!/usr/bin/env node
/**
 * 抖音 PVA CLI 包装 — login / upload
 * 上游: @panda-video-automation/pva
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function defaultPlaywrightBrowsersPath() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  }
  if (process.env.PLAYWRIGHT_BROWSERS_ROOT) {
    return process.env.PLAYWRIGHT_BROWSERS_ROOT;
  }
  return join(profileRoot, 'tool/playwright-browsers');
}

function playwrightHeadlessMarker(browsersPath) {
  const base = join(browsersPath, 'chromium_headless_shell-1228');
  const candidates =
    process.platform === 'win32'
      ? [join(base, 'chrome-headless-shell-win64/chrome-headless-shell.exe')]
      : process.platform === 'darwin'
        ? [
            join(base, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'),
            join(base, 'chrome-headless-shell-mac-x64/chrome-headless-shell'),
          ]
        : [join(base, 'chrome-headless-shell-linux64/chrome-headless-shell')];
  return candidates.find((p) => existsSync(p));
}

function playwrightEnv() {
  const browsersPath = defaultPlaywrightBrowsersPath();
  if (!playwrightHeadlessMarker(browsersPath)) {
    console.error(`Playwright 浏览器未安装: ${browsersPath}`);
    console.error('请先执行: npm run douyin:setup');
    console.error('Agent 见: workspace/references/playwright-install-runbook.md');
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
  const shellCmd = ['npx', '-y', '@panda-video-automation/pva', ...pvaArgs].map(quoteArg).join(' ');
  const result = spawnSync(shellCmd, {
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

npm: douyin:setup | douyin:login | douyin:upload

Playwright 路径: ${defaultPlaywrightBrowsersPath()}

示例:
  npm run douyin:upload -- --video "D:/path/video.mp4" --title "标题"`);
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
