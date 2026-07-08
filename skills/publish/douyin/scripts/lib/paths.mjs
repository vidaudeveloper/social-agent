import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

export const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const repoRoot = join(skillRoot, '../..');
export const scriptsRoot = join(skillRoot, 'scripts');

export const profilePath =
  process.env.USER_PROFILE_PATH || join(repoRoot, 'user-profile.md');

export const hermesRoot = process.env.HERMES_ROOT || './content';

export const stylePath = join(scriptsRoot, 'templates/scene-style.json');

export const defaultBgmPath = join(skillRoot, 'assets/default-bgm.mp3');

export const hermesBgmPath = join(hermesRoot, '音频/douyin-bgm.mp3');

/** @returns {string | null} */
export function resolveBgmPath(customPath) {
  if (customPath && existsSync(customPath)) return customPath;
  if (process.env.DOUYIN_BGM && existsSync(process.env.DOUYIN_BGM)) {
    return process.env.DOUYIN_BGM;
  }
  if (existsSync(hermesBgmPath)) return hermesBgmPath;
  if (existsSync(defaultBgmPath)) return defaultBgmPath;
  return null;
}
