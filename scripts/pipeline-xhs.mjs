#!/usr/bin/env node
/**
 * 小红书配图管线：MD → cover.png + card_*.png + manifest.json
 */
import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hermesRoot } from './lib/hermes-paths.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const runCard = join(scriptDir, 'run-xhs-card.mjs');

function usage() {
  console.error(`用法:
  npm run pipeline:xhs -- -Slug <slug>
  npm run pipeline:xhs -- -File <配图.md绝对路径> [-Theme professional] [-Mode auto-split]

输出目录: {HERMES_ROOT}/图片/小红书/<slug或文件名>/manifest.json`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { slug: '', file: '', theme: 'professional', mode: 'auto-split' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '-Slug' || a === '--slug') {
      opts.slug = next || '';
      i += 1;
    } else if (a === '-File' || a === '--file') {
      opts.file = next || '';
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

function findMdBySlug(slug) {
  const dir = join(hermesRoot, '文章', '小红书');
  if (!existsSync(dir)) {
    throw new Error(`目录不存在: ${resolve(dir)}`);
  }
  const needle = slug.toLowerCase();
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.md'));
  const matches = files.filter((f) => f.toLowerCase().includes(needle));
  if (matches.length === 0) {
    throw new Error(`未找到含 slug "${slug}" 的 MD，目录: ${resolve(dir)}`);
  }
  const peitu = matches.find((f) => /配图/i.test(f));
  const picked = peitu || matches.sort().at(-1);
  return join(dir, picked);
}

function collectImages(outDir) {
  const names = readdirSync(outDir).filter((f) => /\.png$/i.test(f));
  const cover = names.includes('cover.png') ? join(outDir, 'cover.png') : null;
  const cards = names
    .filter((f) => /^card_\d+\.png$/i.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)?.[0] || 0);
      const nb = Number(b.match(/\d+/)?.[0] || 0);
      return na - nb;
    })
    .map((f) => join(outDir, f));
  const images = [];
  if (cover) images.push(cover);
  images.push(...cards);
  return images;
}

const opts = parseArgs(process.argv.slice(2));
let mdPath = opts.file ? resolve(opts.file) : '';
if (!mdPath && opts.slug) {
  mdPath = resolve(findMdBySlug(opts.slug));
} else if (!mdPath) {
  usage();
}

const baseName = mdPath.split(/[/\\]/).pop().replace(/\.md$/i, '');
const outSlug = opts.slug || baseName.replace(/^\d{8}_/, '');
const outDir = join(hermesRoot, '图片', '小红书', outSlug);

const cardArgs = [
  runCard,
  '-File',
  mdPath,
  '-Out',
  outDir,
  '-Theme',
  opts.theme,
  '-Mode',
  opts.mode,
];

const r = spawnSync('node', cardArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env },
});
if (r.status !== 0) process.exit(r.status ?? 1);

const images = collectImages(outDir);
const manifest = {
  slug: outSlug,
  source_md: resolve(mdPath),
  out_dir: resolve(outDir),
  theme: opts.theme,
  mode: opts.mode,
  images: images.map((p) => resolve(p)),
  cover: images[0] || null,
  cards: images.slice(1),
  generated_at: new Date().toISOString(),
};
const manifestPath = join(outDir, 'manifest.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(
  JSON.stringify(
    {
      success: true,
      manifest: resolve(manifestPath),
      outDir: resolve(outDir),
      imageCount: images.length,
      images: manifest.images,
    },
    null,
    2,
  ),
);
