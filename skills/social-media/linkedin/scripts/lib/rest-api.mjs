import { loadLinkedInApiConfig } from './config.mjs';
import { loadToken, saveToken } from './token-store.mjs';
import { refreshAccessToken } from './oauth.mjs';

function apiHeaders(accessToken, config) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': config.apiVersion,
  };
}

async function ensureAccessToken() {
  const stored = loadToken();
  if (!stored?.accessToken) {
    throw new Error('未登录。请先执行: npm run linkedin:login');
  }
  const config = loadLinkedInApiConfig();
  if (stored.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(stored.refreshToken);
      const next = {
        ...stored,
        accessToken: refreshed.access_token,
        expiresIn: refreshed.expires_in,
        refreshToken: refreshed.refresh_token || stored.refreshToken,
        obtainedAt: new Date().toISOString(),
      };
      saveToken(next);
      return { accessToken: next.accessToken, config, profile: next.profile };
    } catch {
      // fall through to existing token
    }
  }
  return { accessToken: stored.accessToken, config, profile: stored.profile };
}

/** 单次 userinfo，不连跑探测 */
export async function fetchMemberProfile(accessToken) {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`userinfo 失败 (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = JSON.parse(text);
  const personUrn = data.sub ? `urn:li:person:${data.sub}` : null;
  return {
    sub: data.sub,
    name: data.name,
    email: data.email,
    personUrn,
  };
}

export async function checkSessionOnce() {
  const { accessToken } = await ensureAccessToken();
  const profile = await fetchMemberProfile(accessToken);
  const stored = loadToken();
  saveToken({ ...stored, accessToken, profile });
  return { ok: true, loggedIn: true, profile };
}

export async function createTextPost(commentary, visibility = 'public') {
  const { accessToken, config, profile: storedProfile } = await ensureAccessToken();
  let profile = storedProfile;
  if (!profile?.personUrn) {
    profile = await fetchMemberProfile(accessToken);
    saveToken({ ...loadToken(), profile });
  }

  const visibilityApi = visibility === 'connections' ? 'CONNECTIONS' : 'PUBLIC';
  const body = {
    author: profile.personUrn,
    commentary,
    visibility: visibilityApi,
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: apiHeaders(accessToken, config),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Posts API 失败 (${res.status}): ${text.slice(0, 500)}`);
  }
  const postId = res.headers.get('x-restli-id') || text || 'ok';
  return { postId, visibility: visibilityApi, author: profile.personUrn };
}
