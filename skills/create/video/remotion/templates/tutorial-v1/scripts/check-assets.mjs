#!/usr/bin/env node
/**
 * Check that public assets referenced by the template exist.
 */
import {existsSync, readFileSync} from 'fs';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const required = [
  'public/voiceover.mp3',
  'public/voiceover-meta.json',
  'public/screenshots/placeholder-dashboard.png',
  'public/screenshots/placeholder-settings.png',
  'public/logos/placeholder.svg',
  'src/kit.ts',
  'src/theme/index.ts',
  'src/components/motion.ts',
  'src/components/PromoLayout.tsx',
];

for (const rel of required) {
  if (!existsSync(join(root, rel))) errors.push(`missing ${rel}`);
}

const metaPath = join(root, 'public/voiceover-meta.json');
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (!meta.beats?.length) errors.push('voiceover-meta.json has no beats');
  if (meta.fps !== 30) errors.push(`unexpected fps: ${meta.fps}`);
}

if (errors.length) {
  console.error('check-assets FAILED');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('check-assets OK');
