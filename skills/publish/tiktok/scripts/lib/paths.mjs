import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const repoRoot = join(skillRoot, '../..');

export const profilePath =
  process.env.USER_PROFILE_PATH || join(repoRoot, 'user-profile.md');

export const hermesRoot = process.env.HERMES_ROOT || './content';
