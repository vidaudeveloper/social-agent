#!/usr/bin/env node
/**
 * Enforce that scene files import locked kit (theme / motion / PromoLayout),
 * and do not redefine local theme/color palettes.
 */
import {readdirSync, readFileSync, statSync, existsSync} from 'fs';
import {dirname, join, relative, resolve} from 'path';
import {fileURLToPath} from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scenesDir = join(root, 'src/components/scenes');
const userScenesDir = join(root, 'src/scenes');

function listTsx(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listTsx(p));
    else if (/\.(tsx|ts)$/.test(name) && name !== 'index.ts') out.push(p);
  }
  return out;
}

const files = [...listTsx(scenesDir), ...listTsx(userScenesDir)];
const errors = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file).replace(/\\/g, '/');

  const importsTheme =
    /from\s+['"][^'"]*theme['"]/.test(text) || /from\s+['"][^'"]*\/kit['"]/.test(text);
  const importsPromo =
    /PromoLayout|PopLayout/.test(text) || /from\s+['"][^'"]*\/kit['"]/.test(text);
  const importsMotion =
    /from\s+['"][^'"]*motion['"]/.test(text) ||
    /beatProgress|slamIn|flyBounce|ratioProgress|beatEnter/.test(text) ||
    /from\s+['"][^'"]*\/kit['"]/.test(text) ||
    /from\s+['"][^'"]*PromoLayout['"]/.test(text);

  if (!importsTheme) errors.push(`${rel}: must import theme (or kit)`);
  if (!importsPromo) errors.push(`${rel}: must use PromoLayout / PopLayout`);
  if (!importsMotion) errors.push(`${rel}: must use motion helpers or beatProgress`);

  if (/export\s+const\s+theme\s*=/.test(text)) {
    errors.push(`${rel}: must not redefine theme`);
  }
  if (/bgGradient\s*:\s*['"]/.test(text) && !rel.includes('PromoLayout')) {
    // scenes shouldn't invent new full backgrounds
    if (!/PromoLayout|PopLayout/.test(text.split('\n').slice(0, 30).join('\n'))) {
      errors.push(`${rel}: suspicious local bgGradient — use PromoLayout`);
    }
  }
}

if (errors.length) {
  console.error('check-kit-imports FAILED');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log(`check-kit-imports OK (${files.length} scene files)`);
