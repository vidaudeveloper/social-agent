import { createServer } from 'http';
import { randomBytes } from 'crypto';
import { URL, URLSearchParams } from 'url';
import { loadLinkedInApiConfig } from './config.mjs';
import { defaultOAuthPort } from './paths.mjs';
import { openUrlInSystemBrowser } from './open-browser.mjs';
import { waitForUserConfirm } from './user-confirm.mjs';

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

function buildAuthUrl(config, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: config.scopes.join(' '),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

function waitForOAuthCallback(redirectUri, expectedState, timeoutMs = 300000) {
  const redirect = new URL(redirectUri);
  const port = Number(redirect.port || defaultOAuthPort());
  const pathname = redirect.pathname || '/callback';

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);
        if (reqUrl.pathname !== pathname) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const code = reqUrl.searchParams.get('code');
        const state = reqUrl.searchParams.get('error_description') || reqUrl.searchParams.get('error');
        const returnedState = reqUrl.searchParams.get('state');
        if (reqUrl.searchParams.get('error')) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h2>授权失败</h2><p>请关闭此页并查看终端。</p>');
          server.close();
          reject(new Error(`OAuth 错误: ${reqUrl.searchParams.get('error')}`));
          return;
        }
        if (!code || returnedState !== expectedState) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h2>无效回调</h2>');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          '<h2>授权成功</h2><p>请回到终端，按提示按 Enter 确认保存令牌。可关闭此页。</p>'
        );
        server.close();
        resolve(code);
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(port, '127.0.0.1', () => {});
    server.on('error', reject);
    setTimeout(() => {
      server.close();
      reject(new Error(`OAuth 超时（${timeoutMs / 1000}s）。请重试 linkedin:login`));
    }, timeoutMs);
  });
}

async function exchangeCode(config, code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`换取 access_token 失败 (${res.status}): ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

/**
 * OAuth 登录：打开授权页 → 用户手动登录授权 → 收到回调后须终端确认再存令牌
 */
export async function runOAuthLogin() {
  const config = loadLinkedInApiConfig();
  const state = randomBytes(16).toString('hex');
  const authUrl = buildAuthUrl(config, state);

  console.log('\n=== LinkedIn 官方 API 授权（个人号）===\n');
  console.log('说明：');
  console.log('  • 将打开浏览器到 LinkedIn **授权页**（不是脚本代填登录）');
  console.log('  • 请你在页面中 **手动** 登录并点击「允许/授权」');
  console.log('  • 脚本 **不会** 自动输入账号密码或连跑检测\n');
  console.log(`回调地址须在 LinkedIn 应用中配置: ${config.redirectUri}\n`);

  await waitForUserConfirm(
    '按 Enter 后打开浏览器并开始等待授权（请确保 LinkedIn 开发者应用已配置 Redirect URL）'
  );

  const callbackPromise = waitForOAuthCallback(config.redirectUri, state);
  openUrlInSystemBrowser(authUrl);
  console.log('\n浏览器已打开。请在浏览器中完成登录与授权…\n');

  const code = await callbackPromise;
  console.log('\n已收到授权码，正在换取访问令牌…');
  const tokenPayload = await exchangeCode(config, code);

  await waitForUserConfirm(
    '若浏览器显示授权成功，且是你本人操作，按 Enter 保存令牌到本机（不会发帖）'
  );

  return {
    accessToken: tokenPayload.access_token,
    expiresIn: tokenPayload.expires_in,
    refreshToken: tokenPayload.refresh_token,
    scope: tokenPayload.scope,
    obtainedAt: new Date().toISOString(),
  };
}

export async function refreshAccessToken(refreshToken) {
  const config = loadLinkedInApiConfig();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`刷新 token 失败 (${res.status}): ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}
