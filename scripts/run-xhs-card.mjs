#!/usr/bin/env node
/**
 * 小红书卡片渲染包装 — 调用 tool/Auto-Redbook-Skills/scripts/render_xhs.py
 */
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { contentRoot, profileRoot, redbookRoot } from './lib/content-paths.mjs';
import { ensureDeps } from './lib/ensure-deps.mjs';

function usage() {
  console.error(`用法: node scripts/run-xhs-card.mjs -File <md绝对路径> [-Out <输出目录>] [-Theme professional] [-Mode auto-split]

环境变量:
  CONTENT_ROOT          内容根目录（默认 ./content）
  AUTO_REDBOOK_ROOT    Auto-Redbook 路径（默认 tool/Auto-Redbook-Skills）

先执行: npm run tool:install`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    file: '',
    out: '',
    theme: 'professional',
    mode: 'auto-split',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '-File' || a === '--file') {
      opts.file = next || '';
      i += 1;
    } else if (a === '-Out' || a === '--out') {
      opts.out = next || '';
      i += 1;
    } else if (a === '-Theme' || a === '--theme') {
      opts.theme = next || opts.theme;
      i += 1;
    } else if (a === '-Mode' || a === '--mode') {
      opts.mode = next || opts.mode;
      i += 1;
    } else if (a === '-h' || a === '--help') {
      usage();
    }
  }
  return opts;
}

ensureDeps(['xhs-card']);

const opts = parseArgs(process.argv.slice(2));
if (!opts.file) usage();

const mdPath = resolve(opts.file);
if (!existsSync(mdPath)) {
  console.error(JSON.stringify({ success: false, error: `文件不存在: ${mdPath}` }));
  process.exit(2);
}

const renderPy = join(redbookRoot, 'scripts', 'render_xhs.py');
if (!existsSync(renderPy)) {
  console.error(
    JSON.stringify({
      success: false,
      error: `未安装 xhs-card-render 工具: ${renderPy}`,
      hint: '请先执行 npm run tool:install',
    }),
  );
  process.exit(2);
}

const baseName = mdPath.split(/[/\\]/).pop().replace(/\.md$/i, '');
const outDir = resolve(opts.out || join(contentRoot, '图片', '小红书', baseName));

const args = [
  renderPy,
  mdPath,
  '-o',
  outDir,
  '-t',
  opts.theme,
  '-m',
  opts.mode,
];

const r = spawnSync('uv', ['run', 'python', ...args], {
  cwd: redbookRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env },
});

if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.log(
  JSON.stringify(
    {
      success: true,
      md: mdPath,
      outDir,
      theme: opts.theme,
      mode: opts.mode,
      profileRoot,
      contentRoot: resolve(contentRoot),
    },
    null,
    2,
  ),
);
