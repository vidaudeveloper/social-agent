#!/usr/bin/env node
/**
 * Scaffold a new Remotion tutorial project from templates/tutorial-v1.
 *
 * Usage:
 *   node skills/create/video/remotion/scripts/init-tutorial.mjs <slug> [--force]
 *   npm run remotion:init -- my-tutorial
 *
 * Target: $CONTENT_ROOT/视频/remotion/{slug}/  or content/视频/remotion/{slug}/
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const templateRoot = join(
  profileRoot,
  'skills/create/video/remotion/templates/tutorial-v1',
);

function usage(msg) {
  if (msg) console.error(msg);
  console.error(
    'Usage: node skills/create/video/remotion/scripts/init-tutorial.mjs <slug> [--force]',
  );
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== '--');
const force = args.includes('--force');
const slug = args.find((a) => !a.startsWith('-'));
if (!slug) usage('missing slug');
if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(slug)) {
  usage('slug must be lowercase letters/digits/hyphens, 2-49 chars');
}

if (!existsSync(templateRoot)) {
  console.error(`template missing: ${templateRoot}`);
  process.exit(1);
}

const contentRoot =
  process.env.CONTENT_ROOT || join(profileRoot, 'content');
const dest = join(contentRoot, '视频', 'remotion', slug);

if (existsSync(dest) && !force) {
  console.error(`refusing to overwrite existing project: ${dest}`);
  console.error('pass --force to replace (deletes destination first)');
  process.exit(1);
}

if (existsSync(dest) && force) {
  rmSync(dest, {recursive: true, force: true});
}

mkdirSync(dirname(dest), {recursive: true});

function copyDir(src, dst) {
  mkdirSync(dst, {recursive: true});
  for (const name of readdirSync(src)) {
    if (name === 'node_modules' || name === 'out' || name === '.remotion') continue;
    const from = join(src, name);
    const to = join(dst, name);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else cpSync(from, to);
  }
}

copyDir(templateRoot, dest);

const pkgPath = join(dest, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = slug;
pkg.description = `Remotion tutorial project scaffolded from tutorial-v1 (${pkg.version})`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const metaPath = join(dest, 'TEMPLATE_ORIGIN.json');
writeFileSync(
  metaPath,
  JSON.stringify(
    {
      template: 'tutorial-v1',
      templateVersion: pkg.version,
      scaffoldedAt: new Date().toISOString(),
      source: 'skills/create/video/remotion/templates/tutorial-v1',
    },
    null,
    2,
  ) + '\n',
);

console.log(`scaffolded: ${dest}`);
console.log('next:');
console.log(`  cd "${dest}"`);
console.log('  npm install');
console.log('  npm run studio');
console.log('edit: src/data/beats.ts, public/screenshots/, voiceover');
console.log('keep: import theme / motion / PromoLayout from src/kit');
