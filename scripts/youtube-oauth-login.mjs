#!/usr/bin/env node
/**
 * 一次性 OAuth：用 Desktop Client 换取 YOUTUBE_REFRESH_TOKEN，写回 .env
 *
 * 用法: npm run youtube:oauth
 */
import { createServer } from 'http';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
].join(' ');

function loadEnvFile(filePath) {
  /** @type {Record<string, string>} */
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const raw of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return env;
}

function upsertEnv(filePath, updates) {
  const lines = existsSync(filePath) ? readFileSync(filePath, 'utf8').split(/\r?\n/) : [];
  const keys = new Set(Object.keys(updates));
  const out = lines.map((line) => {
    for (const key of keys) {
      if (line.startsWith(`${key}=`) || line.startsWith(`# ${key}=`) || line.startsWith(`#${key}=`)) {
        keys.delete(key);
        return `${key}=${updates[key]}`;
      }
    }
    return line;
  });
  for (const key of keys) {
    out.push(`${key}=${updates[key]}`);
  }
  writeFileSync(filePath, `${out.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n').replace(/\n*$/, '\n')}`, 'utf8');
}

function resolveChromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const home = process.env.LOCALAPPDATA || '';
  const pf = process.env.ProgramFiles || 'C:\\Program Files';
  const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const candidates = [
    join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(home, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'D:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'D:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

function openBrowser(url) {
  // 强制用 Google Chrome（OAuth / YouTube 登录常用）；勿用 cmd start，否则 & 被截断
  if (process.platform === 'win32') {
    const chrome = resolveChromePath();
    if (!chrome) {
      console.error('[error] 未找到 Google Chrome。请安装 Chrome，或设置环境变量 CHROME_PATH=chrome.exe 完整路径');
      console.error('授权 URL（可手动粘贴到 Chrome）：');
      console.error(url);
      return;
    }
    console.log(`[oauth] 使用 Chrome: ${chrome}`);
    spawn(chrome, [url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  if (process.platform === 'darwin') {
    spawn('open', ['-a', 'Google Chrome', url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  const linuxChrome = ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium'].find(Boolean);
  spawn(linuxChrome, [url], { detached: true, stdio: 'ignore' }).unref();
}

const envPath = join(profileRoot, '.env');
const fileEnv = loadEnvFile(envPath);
const clientId = process.env.YOUTUBE_CLIENT_ID || fileEnv.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || fileEnv.YOUTUBE_CLIENT_SECRET;
const apiKey = process.env.YOUTUBE_API_KEY || fileEnv.YOUTUBE_API_KEY || '';

if (!clientId || !clientSecret) {
  console.error('[error] 缺少 YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET');
  console.error('请先把 Google 下载的 client_secret JSON 配进 .env');
  process.exit(2);
}

const state = randomBytes(16).toString('hex');
// Desktop loopback：固定端口，便于在 GCP Clients 里预登记 Redirect URI
const port = Number(process.env.YOUTUBE_OAUTH_PORT || 17890);
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

console.log('将用 Google Chrome 打开授权页。');
console.log(`请确认 GCP OAuth Client 的重定向 URI 包含：${redirectUri}`);
console.log('（Desktop 类型一般可用 loopback；若失败请在 Clients 里手动加这条 redirect）');
console.log('');

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');
authUrl.searchParams.set('state', state);

/** @type {import('http').Server} */
let server;
const codePromise = new Promise((resolveCode, rejectCode) => {
  const timer = setTimeout(() => {
    server?.close();
    rejectCode(new Error('授权超时（5 分钟）'));
  }, 5 * 60 * 1000);

  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
      if (url.pathname !== '/oauth2callback') {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      const err = url.searchParams.get('error');
      if (err) throw new Error(`OAuth error: ${err}`);
      if (url.searchParams.get('state') !== state) throw new Error('state mismatch');
      const code = url.searchParams.get('code');
      if (!code) throw new Error('missing code');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>授权成功</h2><p>可以关闭此页，回到终端。</p>');
      clearTimeout(timer);
      resolveCode(code);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(e));
      clearTimeout(timer);
      rejectCode(e);
    } finally {
      setTimeout(() => server.close(), 200);
    }
  });

  server.once('error', (err) => {
    clearTimeout(timer);
    if (err && /** @type {NodeJS.ErrnoException} */ (err).code === 'EADDRINUSE') {
      rejectCode(
        new Error(
          `端口 ${port} 被占用（上次 oauth 可能未退出）。请结束占用进程后重试，或设 YOUTUBE_OAUTH_PORT=其他端口（GCP redirect 需同步改）`,
        ),
      );
      return;
    }
    rejectCode(err);
  });

  server.listen(port, '127.0.0.1', () => {
    openBrowser(authUrl.toString());
    console.log('若 Chrome 未弹出，请把下面 URL 粘贴到 Chrome：');
    console.log(authUrl.toString());
  });
});

const code = await codePromise;

const body = new URLSearchParams({
  code,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  grant_type: 'authorization_code',
});

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body,
});
const tokenJson = await tokenRes.json();
if (!tokenRes.ok) {
  console.error('[error] token exchange failed');
  console.error(JSON.stringify({ error: tokenJson.error, error_description: tokenJson.error_description }));
  process.exit(1);
}

const refreshToken = tokenJson.refresh_token;
if (!refreshToken) {
  console.error('[error] 未返回 refresh_token。请在 GCP 撤消该应用访问后重试（需 prompt=consent）。');
  process.exit(1);
}

upsertEnv(envPath, { YOUTUBE_REFRESH_TOKEN: refreshToken });

const cfgDir = join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'youtube-analytics-cli');
mkdirSync(cfgDir, { recursive: true });
writeFileSync(
  join(cfgDir, 'credentials.json'),
  JSON.stringify(
    {
      api_key: apiKey,
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
    null,
    2,
  ),
  'utf8',
);

console.log('');
console.log('[done] YOUTUBE_REFRESH_TOKEN 已写入 .env');
console.log(`[done] credentials.json -> ${join(cfgDir, 'credentials.json')}`);
console.log('验证: npm run youtube:stats -- channels');
