import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { linkedInDataDir, tokenFilePath } from './paths.mjs';

export function loadToken() {
  const path = tokenFilePath();
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

export function saveToken(data) {
  mkdirSync(linkedInDataDir(), { recursive: true });
  writeFileSync(
    tokenFilePath(),
    `${JSON.stringify({ ...data, savedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8'
  );
}

export function clearToken() {
  const path = tokenFilePath();
  if (existsSync(path)) {
    writeFileSync(path, '', 'utf8');
  }
}
