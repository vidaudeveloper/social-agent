#!/usr/bin/env node
/**
 * signal-fire 路径封装
 */
import { existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_ROOT = './tool/signal-fire';

export function signalFireRoot() {
  return (process.env.SIGNAL_FIRE_ROOT || DEFAULT_ROOT).replace(/\\/g, '/');
}

export function signalFireAvailable() {
  return existsSync(join(signalFireRoot(), 'dist/cli/index.js'));
}
