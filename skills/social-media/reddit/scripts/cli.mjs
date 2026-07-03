#!/usr/bin/env node
/**
 * Reddit CLI 封装 — 调用 tool/reddit-skills/scripts/cli.py
 * 发布类命令经质量门禁（禁止测试帖、短垃圾文、测试版块）
 */
import { runRedditCli } from '../../../scripts/lib/reddit.mjs';
import {
  collectPublishPayload,
  formatValidationReport,
  shouldValidateCommand,
  validateRedditPublish,
} from '../../../scripts/lib/reddit-quality.mjs';

const [command, ...rest] = process.argv.slice(2);

const alias = {
  login: ['check-login'],
  feed: ['subreddit-feed'],
  validate: ['validate-publish'],
};

function resolveCommand(cmd) {
  if (cmd === 'validate-publish') {
    return { action: 'validate-only', publishCmd: null, args: rest };
  }
  if (cmd === 'publish') {
    return { action: 'publish-alias', publishCmd: 'submit-text', args: rest };
  }
  if (alias[cmd]) {
    return { action: 'forward', publishCmd: null, args: alias[cmd].concat(rest) };
  }
  if (shouldValidateCommand(cmd)) {
    return { action: 'maybe-publish', publishCmd: cmd, args: rest };
  }
  return { action: 'forward', publishCmd: null, args: cmd ? [cmd, ...rest] : [] };
}

function runQualityGate(publishCmd, args) {
  if (process.env.REDDIT_SKIP_QUALITY_CHECK === 'true') {
    console.warn('⚠️ REDDIT_SKIP_QUALITY_CHECK=true，已跳过质量检查（不推荐）');
    return true;
  }

  const payload = collectPublishPayload(args, publishCmd);
  if (payload.error) {
    console.error('❌', payload.error);
    process.exit(1);
  }

  const result = validateRedditPublish(payload);
  console.log(formatValidationReport(result, payload));

  if (!result.ok) {
    console.error('\n发布已取消。请修订文稿后重试，或仅本地调试时设置 REDDIT_ALLOW_TEST_SUBREDDIT=true');
    process.exit(1);
  }
  return true;
}

if (!command) {
  console.log(`Reddit CLI（1146345502/reddit-skills）

  check-login | login
  subreddit-feed | feed --subreddit NAME [--sort hot]
  validate-publish --subreddit NAME --title-file t.txt --body-file b.txt
  submit-text | publish --subreddit NAME --title-file ... --body-file ...

发布前自动质量检查：
  • 禁止 r/test、r/cicd 等测试版块
  • 禁止 integration test / please ignore / hermes 等测试文案
  • 禁止 #hashtag；正文建议 ≥200 字 / ≥40 词

npm: reddit:check-login | reddit:validate | reddit:publish`);
  process.exit(0);
}

const resolved = resolveCommand(command);

if (resolved.action === 'validate-only') {
  const publishCmd = rest.includes('--url') ? 'submit-link' : rest.includes('--images') ? 'submit-image' : 'submit-text';
  const payload = collectPublishPayload(resolved.args, publishCmd);
  if (payload.error) {
    console.error('❌', payload.error);
    process.exit(1);
  }
  const result = validateRedditPublish(payload);
  console.log(formatValidationReport(result, payload));
  process.exit(result.ok ? 0 : 1);
}

if (resolved.action === 'publish-alias' || resolved.action === 'maybe-publish') {
  const publishCmd = resolved.publishCmd;
  runQualityGate(publishCmd, resolved.args);
  runRedditCli([publishCmd, ...resolved.args]);
  process.exit(0);
}

runRedditCli(resolved.args);
