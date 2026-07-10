#!/usr/bin/env node
/** @deprecated 请使用 run-pipeline.mjs；本脚本仅作 --fallback 快捷入口 */
import { spawnSync } from 'child_process';
import { join } from 'path';

const args = process.argv.slice(2);
const hasFallback = args.includes('--fallback');
const pipelineArgs = hasFallback ? args : ['--fallback', ...args];

console.warn('[deprecated] run-full.mjs → run-pipeline.mjs (--fallback)\n');

const r = spawnSync('node', [join(import.meta.dirname, 'run-pipeline.mjs'), ...pipelineArgs], {
  stdio: 'inherit',
  shell: true,
});

process.exit(r.status ?? 1);
