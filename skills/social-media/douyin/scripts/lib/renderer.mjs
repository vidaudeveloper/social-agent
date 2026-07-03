import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @returns {'ffmpeg' | 'ffcreator'}
 */
export function resolveRenderer() {
  const forced = process.env.DOUYIN_RENDERER?.toLowerCase();
  if (forced === 'ffcreator' || forced === 'ffmpeg') {
    return forced;
  }
  const ffcPath = join(skillRoot, 'node_modules/ffcreator');
  if (existsSync(ffcPath) && process.platform !== 'win32') {
    return 'ffcreator';
  }
  return 'ffmpeg';
}
