#!/usr/bin/env node
/**
 * LinkedIn 个人号 — 官方 OAuth + Posts API（非浏览器爬取）
 * 公司主页预留见 references/company-page.md
 */
import { existsSync, readFileSync } from 'fs';
import { runOAuthLogin } from './lib/oauth.mjs';
import { saveToken, loadToken } from './lib/token-store.mjs';
import { checkSessionOnce, createTextPost, fetchMemberProfile } from './lib/rest-api.mjs';
import { waitForUserConfirm } from './lib/user-confirm.mjs';
import { linkedInDataDir } from './lib/paths.mjs';
import { requireOverseasConsent } from '../../../scripts/lib/overseas-guard.mjs';

function parseArgs(argv) {
  const opts = { visibility: 'public' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i];
    else if (a === '--file' || a === '-f') opts.file = argv[++i];
    else if (a === '--visibility') opts.visibility = argv[++i];
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  opts.text = process.env.LINKEDIN_POST_TEXT || opts.text || '';
  return opts;
}

function assertPersonalAccountMode() {
  const mode = (process.env.LINKEDIN_ACCOUNT_TYPE || 'personal').toLowerCase();
  if (mode === 'company') {
    console.error('❌ 公司主页 API 尚未接入，见 references/company-page.md');
    process.exit(1);
  }
}

async function cmdLogin() {
  assertPersonalAccountMode();
  const token = await runOAuthLogin();
  let profile = null;
  try {
    profile = await fetchMemberProfile(token.accessToken);
  } catch (err) {
    console.warn('获取 userinfo 失败（令牌已保存）:', err.message);
  }
  saveToken({ ...token, profile });
  console.log('\n✅ 令牌已保存到:', linkedInDataDir());
  if (profile?.name) {
    console.log(`   身份: ${profile.name} (${profile.personUrn})`);
  }
  console.log('\n下一步（单次）: npm run linkedin:check-login');
}

async function cmdCheckLogin() {
  assertPersonalAccountMode();
  await waitForUserConfirm('将调用一次 LinkedIn userinfo 检查登录态。确认后按 Enter');
  try {
    const result = await checkSessionOnce();
    console.log(JSON.stringify({ ok: true, loggedIn: result.loggedIn, profile: result.profile }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, loggedIn: false, error: err.message }, null, 2));
    process.exit(1);
  }
}

async function cmdPublish(argv) {
  assertPersonalAccountMode();
  const { text, file, visibility } = parseArgs(argv);
  let content = text;
  if (file) {
    if (!existsSync(file)) {
      console.error('文件不存在:', file);
      process.exit(1);
    }
    content = readFileSync(file, 'utf8');
  }
  if (!content.trim()) {
    console.error('用法: publish --text "..." 或 --file article.md [--visibility public|connections]');
    process.exit(1);
  }
  if (!['connections', 'public'].includes(visibility)) {
    console.error('--visibility 仅支持 public 或 connections');
    process.exit(1);
  }
  if (!loadToken()?.accessToken) {
    console.error('未登录。请先: npm run linkedin:login');
    process.exit(1);
  }

  const preview = content.length > 120 ? `${content.slice(0, 120)}…` : content;
  console.log(`\n即将通过 **官方 Posts API** 发布个人动态`);
  console.log(`可见性: ${visibility}`);
  console.log(`预览: ${preview}\n`);
  await waitForUserConfirm('确认内容无误且已在 LinkedIn 开发者应用开通 w_member_social 后，按 Enter 发布');

  const result = await createTextPost(content, visibility);
  console.log('✅ 发布成功');
  console.log(JSON.stringify(result, null, 2));
}

const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.log(`LinkedIn CLI（个人号 · 官方 OAuth + Posts API）

  login | check-login | publish --text "..." | publish --file path.md

  流程：打开授权页 → 你手动登录授权 → 终端按 Enter 确认 → 再存令牌/发帖
  配置：LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET（Hermes .env）
  文档：skills/linkedin/references/linkedin-api-setup.md

  须 OVERSEAS_ALLOW_AUTOMATION=true 执行命令（防 Agent 误触）

npm: linkedin:login | linkedin:check-login | linkedin:publish`);
  process.exit(0);
}

if (command === 'login') {
  requireOverseasConsent('linkedin', 'login');
  await cmdLogin();
} else if (command === 'check-login') {
  requireOverseasConsent('linkedin', 'check-login');
  await cmdCheckLogin();
} else if (command === 'publish') {
  requireOverseasConsent('linkedin', 'publish');
  await cmdPublish(rest);
} else {
  console.error('未知命令:', command);
  process.exit(1);
}
