#!/usr/bin/env node
/**
 * npm run deps:check -- --platform xhs-card,youtube,x
 */
import { checkDeps, DEP_CHECKS } from './lib/ensure-deps.mjs';

const args = process.argv.slice(2);
let platforms = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--platform' || args[i] === '-p') {
    platforms = (args[i + 1] || '').split(',').map((s) => s.trim()).filter(Boolean);
    break;
  }
}

if (platforms.length === 0) {
  platforms = Object.keys(DEP_CHECKS);
}

const { ok, missing } = checkDeps(platforms);

if (ok) {
  console.log(`[deps:check] OK (${platforms.join(', ')})`);
  process.exit(0);
}

for (const m of missing) {
  console.error(`[MISSING] platform=${m.platform} label=${m.label}`);
  console.error(`fix: ${m.fix}`);
}
console.error('详见: workspace/references/dependency-policy.md');
process.exit(2);
