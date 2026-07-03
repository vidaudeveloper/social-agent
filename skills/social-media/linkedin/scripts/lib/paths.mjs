import { homedir } from 'os';
import { join } from 'path';

export function linkedInDataDir() {
  if (process.env.LINKEDIN_DATA_DIR) {
    return process.env.LINKEDIN_DATA_DIR;
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'auto-content-pipeline', 'linkedin-api');
  }
  return join(homedir(), '.auto-content-pipeline', 'linkedin-api');
}

export const tokenFilePath = () => join(linkedInDataDir(), 'oauth-token.json');

export function defaultRedirectUri() {
  return process.env.LINKEDIN_REDIRECT_URI || 'http://127.0.0.1:8765/callback';
}

export function defaultOAuthPort() {
  const u = new URL(defaultRedirectUri());
  return Number(u.port || 8765);
}
