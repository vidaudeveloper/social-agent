import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

export const profileRoot = resolve(scriptsDir, '..', '..');

/** 内容归档根目录（默认仓库内 content/）。环境变量：CONTENT_ROOT */
export const contentRoot = resolve(profileRoot, process.env.CONTENT_ROOT || 'content');

export const redbookRoot = resolve(
  profileRoot,
  (process.env.AUTO_REDBOOK_ROOT || 'tool/Auto-Redbook-Skills').replace(/\\/g, '/'),
);
