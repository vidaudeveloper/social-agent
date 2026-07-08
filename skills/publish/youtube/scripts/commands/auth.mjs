import { join } from 'path';
import { sauAccount, runSau, sauAvailable, sauRoot } from '../../../../scripts/lib/sau.mjs';

function cookiePath(account) {
  return join(sauRoot, 'cookies', `youtube_${account}.json`);
}

export async function cmdCheckLogin() {
  if (!sauAvailable()) {
    console.error(JSON.stringify({
      ok: false,
      loggedIn: false,
      error: 'social-auto-upload 未安装。请运行: npm run overseas:install',
    }, null, 2));
    process.exit(1);
  }

  const account = sauAccount('youtube');
  const r = runSau(['youtube', 'check', '--account', account], { silent: true });
  const out = (r.stdout || '').trim();
  const loggedIn = out === 'valid';

  console.log(JSON.stringify({
    ok: true,
    loggedIn,
    account,
    backend: 'sau',
    cookieFile: cookiePath(account),
  }, null, 2));

  if (!loggedIn) {
    console.error('\n⚠️  check 返回 invalid 时请勿立即 re-login。');
    console.error('   1. 检查 tool/social-auto-upload/conf.py 的 YT_PROXY（国内必配）');
    console.error('   2. 间隔至少 30 分钟后再试 login');
    console.error('   3. 日常发布可直接 publish，sau 会在失效时提示');
    process.exit(1);
  }
  process.exit(0);
}

export async function cmdLogin() {
  if (!sauAvailable()) {
    console.error('请先安装 social-auto-upload: npm run overseas:install');
    console.error('文档: skills/publish/youtube/skills/publish/youtube-upload/references/runtime-requirements.md');
    process.exit(1);
  }

  const account = sauAccount('youtube');
  console.log(`=== sau youtube login (account: ${account}) ===`);
  console.log(`Cookie 将保存到: ${cookiePath(account)}`);
  console.log('登录一次即可；之后尽量只 publish，少跑 check-login。\n');

  runSau(['youtube', 'login', '--account', account]);
}
