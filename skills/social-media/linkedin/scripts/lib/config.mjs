export function loadLinkedInApiConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      '缺少 LinkedIn API 凭据。请在 Hermes .env 配置 LINKEDIN_CLIENT_ID 与 LINKEDIN_CLIENT_SECRET（见 skills/linkedin/references/linkedin-api-setup.md）'
    );
  }
  return {
    clientId,
    clientSecret,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI?.trim() || 'http://127.0.0.1:8765/callback',
    apiVersion: process.env.LINKEDIN_API_VERSION?.trim() || '202601',
    scopes: (process.env.LINKEDIN_OAUTH_SCOPES || 'openid profile w_member_social')
      .split(/\s+/)
      .filter(Boolean),
  };
}
