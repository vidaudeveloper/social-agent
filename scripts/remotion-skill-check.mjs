#!/usr/bin/env node
/**
 * Remotion skill 完整性检查（不下载 npm 依赖）
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = join(profileRoot, 'skills/create/video/remotion');
const skillMd = join(skillRoot, 'SKILL.md');
const rulesDir = join(skillRoot, 'rules');

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
}

main();
