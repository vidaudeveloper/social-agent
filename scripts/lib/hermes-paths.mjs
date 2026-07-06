import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

export const profileRoot = resolve(scriptsDir, '..', '..');
export const hermesRoot = resolve(profileRoot, process.env.HERMES_ROOT || 'content');
export const redbookRoot = resolve(
  profileRoot,
  (process.env.AUTO_REDBOOK_ROOT || 'tool/Auto-Redbook-Skills').replace(/\\/g, '/'),
);
