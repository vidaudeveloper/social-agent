#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

const r = isWin
  ? spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(root, 'install-xhs-tools.ps1')],
      { stdio: 'inherit', cwd: root },
    )
  : spawnSync('bash', [join(root, 'install-xhs-tools.sh')], { stdio: 'inherit', cwd: root });

process.exit(r.status ?? 1);
