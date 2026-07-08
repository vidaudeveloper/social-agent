/**
 * 验证 X 登录 cookie 是否已写入 baoyu Chrome profile（auth_token + ct0）
 */
import { resolve, join } from 'path';
import { pathToFileURL } from 'url';

const profileDir = process.argv[2];
if (!profileDir) {
  console.error('用法: bun scripts/baoyu-verify-x-session.ts <profileDir> [debugPort]');
  process.exit(2);
}

function baoyuRoot() {
  return (process.env.BAOYU_SKILLS_ROOT || './tool/baoyu-skills-vendor').replace(/\\/g, '/');
}

const utilsUrl = pathToFileURL(
  resolve(baoyuRoot(), 'skills/baoyu-post-to-x/scripts/x-utils.js'),
).href;

const {
  findExistingChromeDebugPort,
  waitForChromeDebugPort,
  CdpConnection,
  readXSessionCookieMap,
  hasRequiredXSessionCookies,
  sleep,
} = await import(utilsUrl);

const preferredPort = process.argv[3] ? Number(process.argv[3]) : undefined;
const port = preferredPort ?? (await findExistingChromeDebugPort(profileDir));

if (!port) {
  console.error('未找到带 remote-debugging 的 Chrome。请保持登录窗口打开后重试。');
  process.exit(1);
}

const wsUrl = await waitForChromeDebugPort(port, 15_000, { includeLastError: true });
const cdp = await CdpConnection.connect(wsUrl, 15_000, { defaultTimeoutMs: 10_000 });

try {
  const start = Date.now();
  while (Date.now() - start < 20_000) {
    const cookieMap = await readXSessionCookieMap(cdp).catch(() => ({}));
    if (hasRequiredXSessionCookies(cookieMap)) {
      console.log(JSON.stringify({ ok: true, profileDir, cookies: ['auth_token', 'ct0'] }));
      process.exit(0);
    }
    await sleep(1000);
  }
  console.log(JSON.stringify({ ok: false, profileDir, error: 'auth_token/ct0 not found yet' }));
  process.exit(1);
} finally {
  cdp.close();
}
