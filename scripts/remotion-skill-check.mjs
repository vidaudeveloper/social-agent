#!/usr/bin/env node
/**
 * Remotion skill 完整性检查（不下载 npm 依赖）
 */
import {existsSync, readFileSync, readdirSync, statSync} from 'fs';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = join(profileRoot, 'skills/create/video/remotion');
const skillMd = join(skillRoot, 'SKILL.md');
const rulesDir = join(skillRoot, 'rules');
const templateRoot = join(skillRoot, 'templates/tutorial-v1');
const initScript = join(skillRoot, 'scripts/init-tutorial.mjs');

function listMdFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      out.push(...listMdFiles(p));
    } else if (name.endsWith('.md') || name.endsWith('.tsx')) {
      out.push(p);
    }
  }
  return out;
}

function main() {
  const errors = [];

  if (!existsSync(skillMd)) {
    errors.push('missing SKILL.md');
  } else {
    const text = readFileSync(skillMd, 'utf8');
    if (!text.includes('name: remotion')) errors.push('SKILL.md missing name: remotion');
    if (!text.includes('tutorial-v1')) errors.push('SKILL.md missing tutorial-v1 reference');
    if (!text.includes('remotion:init')) errors.push('SKILL.md missing remotion:init flow');
    const ruleRefs = [...text.matchAll(/rules\/[a-z0-9-]+\.md/g)].map((m) => m[0]);
    for (const ref of ruleRefs) {
      const path = join(skillRoot, ref.replace(/\//g, '\\'));
      if (!existsSync(path)) errors.push(`broken link: ${ref}`);
    }
  }

  if (!existsSync(rulesDir)) {
    errors.push('missing rules/');
  } else {
    const files = listMdFiles(rulesDir);
    if (files.length < 30) errors.push(`rules/ too few files: ${files.length}`);
  }

  if (!existsSync(initScript)) errors.push('missing scripts/init-tutorial.mjs');

  const templateRequired = [
    'package.json',
    'TEMPLATE.md',
    'src/kit.ts',
    'src/theme/index.ts',
    'src/components/motion.ts',
    'src/components/PromoLayout.tsx',
    'src/components/BrandBar.tsx',
    'src/components/DotGlobe.tsx',
    'src/TutorialComposition.tsx',
    'src/data/beats.ts',
    'public/voiceover-meta.json',
    'public/voiceover.mp3',
    'public/screenshots/placeholder-dashboard.png',
    'scripts/check-kit-imports.mjs',
    'scripts/check-assets.mjs',
  ];
  if (!existsSync(templateRoot)) {
    errors.push('missing templates/tutorial-v1/');
  } else {
    for (const rel of templateRequired) {
      if (!existsSync(join(templateRoot, rel))) {
        errors.push(`template missing: ${rel}`);
      }
    }
    // Ensure ignore rules exist; do not fail merely because local npm install created node_modules
    const gi = existsSync(join(templateRoot, '.gitignore'))
      ? readFileSync(join(templateRoot, '.gitignore'), 'utf8')
      : '';
    for (const banned of ['node_modules', 'out', '.remotion']) {
      if (!gi.includes(banned)) {
        errors.push(`template .gitignore must ignore ${banned}`);
      }
    }
    if (!existsSync(join(templateRoot, 'package-lock.json'))) {
      errors.push('template missing package-lock.json (run npm install in template once)');
    }
    const pkg = JSON.parse(readFileSync(join(templateRoot, 'package.json'), 'utf8'));
    for (const dep of ['remotion', '@remotion/cli', '@remotion/media', 'react']) {
      if (!pkg.dependencies?.[dep]) errors.push(`template package.json missing ${dep}`);
    }
  }

  if (errors.length) {
    console.error('remotion skill check FAILED');
    for (const e of errors) console.error(' -', e);
    process.exit(1);
  }

  const ruleCount = listMdFiles(rulesDir).length;
  const sizeKb = Math.round(
    listMdFiles(rulesDir).reduce((s, f) => s + statSync(f).size, 0) / 1024,
  );
  console.log(`remotion skill check OK`);
  console.log(`  path: ${skillRoot}`);
  console.log(`  rules: ${ruleCount} files (~${sizeKb} KB)`);
  console.log(`  template: ${templateRoot}`);
}

main();
