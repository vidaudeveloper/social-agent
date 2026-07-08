#!/usr/bin/env node
/**
 * 知乎发布 CLI — MD/纯文本 → HTML，经 pyzhihu API 直发（绕过 zhihu article 单 <p> 包裹）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { markdownToZhihuHtml } from '../../../../scripts/lib/zhihu-html.mjs';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publishPy = join(skillRoot, 'scripts', 'publish.py');

function parseArgs(argv) {
  const opts = {
    title: '',
    titleFile: '',
    contentFile: '',
    htmlFile: '',
    out: '',
    images: [],
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--title') opts.title = argv[++i] ?? '';
    else if (a === '--title-file') opts.titleFile = argv[++i] ?? '';
    else if (a === '--content-file') opts.contentFile = argv[++i] ?? '';
    else if (a === '--html-file') opts.htmlFile = argv[++i] ?? '';
    else if (a === '--out' || a === '-o') opts.out = argv[++i] ?? '';
    else if (a === '--image' || a === '-i') opts.images.push(argv[++i] ?? '');
    else if (a === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function readText(path) {
  const abs = resolve(path);
  if (!existsSync(abs)) {
    console.error('❌ 文件不存在:', abs);
    process.exit(1);
  }
  return readFileSync(abs, 'utf8');
}

function runZhihu(args) {
  const r = spawnSync('zhihu', args, {
    shell: true,
    stdio: 'inherit',
    encoding: 'utf8',
  });
  if (r.error) {
    console.error('❌ 未找到 zhihu 命令。请先安装: uv tool install pyzhihu-cli');
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

function resolveTitle(opts) {
  if (opts.titleFile) {
    return readText(opts.titleFile).trim();
  }
  return opts.title.trim();
}

function resolveSourceAndHtml(opts) {
  if (opts.htmlFile) {
    const html = readText(opts.htmlFile).trim();
    return { sourcePath: resolve(opts.htmlFile), html, fromHtml: true };
  }
  if (!opts.contentFile) {
    console.error('❌ 需要 --content-file（.md）或 --html-file（.html）');
    process.exit(1);
  }
  const sourcePath = resolve(opts.contentFile);
  const source = readText(sourcePath);
  const html = markdownToZhihuHtml(source);
  return { sourcePath, html, fromHtml: false };
}

function defaultOutPath(sourcePath, fromHtml) {
  if (fromHtml) {
    return sourcePath.replace(/\.html?$/i, '') + '.converted.html';
  }
  return sourcePath.replace(/\.md$/i, '.html');
}

function cmdConvert(argv) {
  const opts = parseArgs(argv);
  if (!opts.contentFile && !opts.htmlFile) {
    console.error('用法: convert --content-file article.md [--out article.html]');
    process.exit(1);
  }
  const { sourcePath, html } = resolveSourceAndHtml(opts);
  const outPath = opts.out ? resolve(opts.out) : defaultOutPath(sourcePath, Boolean(opts.htmlFile));
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  console.log('✅ HTML 已写入:', outPath);
  console.log('预览前 400 字:\n', html.slice(0, 400) + (html.length > 400 ? '...' : ''));
}

function cmdPublish(argv) {
  const opts = parseArgs(argv);
  const title = resolveTitle(opts);
  if (!title) {
    console.error('❌ 需要 --title 或 --title-file');
    process.exit(1);
  }

  const { sourcePath, html } = resolveSourceAndHtml(opts);
  if (!html) {
    console.error('❌ 正文为空');
    process.exit(1);
  }

  const outPath = opts.out ? resolve(opts.out) : defaultOutPath(sourcePath, Boolean(opts.htmlFile));
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  console.log('📄 HTML:', outPath);
  console.log('📝 标题:', title);
  console.log('📏 正文长度:', html.length, '字符');

  if (opts.dryRun) {
    console.log('🔍 dry-run：未调用发布 API');
    return;
  }

  const pyArgs = ['python', publishPy, '--title', title, '--html-file', outPath];
  for (const img of opts.images) {
    pyArgs.push('--image', img);
  }

  const r = spawnSync(pyArgs[0], pyArgs.slice(1), {
    shell: true,
    stdio: 'inherit',
    encoding: 'utf8',
  });
  if (r.error) {
    console.error('❌ 发布失败:', r.error.message);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

const [command, ...rest] = process.argv.slice(2);

if (!command || command === 'help' || command === '--help') {
  console.log(`知乎发布（HTML 版）

  check-login | login          zhihu status / login --qrcode
  convert --content-file a.md [--out a.html]
  publish --title "标题" --content-file a.md [--image cover.jpg]
  publish --title-file t.txt --html-file a.html
  publish ... --dry-run        只生成 HTML，不发布

npm: zhihu:convert | zhihu:publish | zhihu:check-login | zhihu:login`);
  process.exit(0);
}

switch (command) {
  case 'check-login':
    runZhihu(['status']);
    break;
  case 'login':
    runZhihu(['login', '--qrcode']);
    break;
  case 'convert':
    cmdConvert(rest);
    break;
  case 'publish':
    cmdPublish(rest);
    break;
  default:
    console.error('未知命令:', command);
    process.exit(1);
}
