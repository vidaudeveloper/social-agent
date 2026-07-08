import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/** skills/publish/youtube 根目录 */
export const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** social-agent profile 仓库根目录 */
export const repoRoot = join(skillRoot, '../..');

export const profilePath =
  process.env.USER_PROFILE_PATH || join(repoRoot, 'user-profile.md');

export const hermesRoot = process.env.HERMES_ROOT || './content';

export const defaultBgImage = join(skillRoot, 'assets/default-bg.jpg');

/** sau YouTube cookie 目录（唯一登录态来源） */
export const sauCookieDir = join(repoRoot, 'tool/social-auto-upload/cookies');
