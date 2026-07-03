import { spawn } from 'child_process';
import { existsSync } from 'fs';

const CHROME_CANDIDATES = [
  process.env.LINKEDIN_CHROME_PATH,
  process.env.X_BROWSER_CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

/** 仅打开 URL，不注入自动化、不代填表单 */
export function openUrlInSystemBrowser(url) {
  if (process.platform === 'win32') {
    const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
    if (chrome) {
      const child = spawn(chrome, [url], { detached: true, stdio: 'ignore' });
      child.unref();
      return true;
    }
    const child = spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  }
  const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
  const child = spawn(opener, [url], { detached: true, stdio: 'ignore' });
  child.unref();
  return true;
}
