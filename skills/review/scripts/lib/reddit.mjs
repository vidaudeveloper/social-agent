import { existsSync, readFileSync } from 'fs';

const TEST_SUBREDDITS = new Set(['test', 'cicd']);
const TEST_PATTERNS = [
  /integration\s+test/i,
  /please\s+ignore/i,
  /\bhermes\b/i,
  /pipeline\s+test/i,
  /\bsocial-agent\s+test\b/i,
];

const VALIDATE_COMMANDS = new Set(['submit-text', 'submit-link', 'submit-image', 'publish']);

export function shouldValidateCommand(cmd) {
  return VALIDATE_COMMANDS.has(cmd);
}

function readFileArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || !args[idx + 1]) {
    return { error: `缺少 ${flag}` };
  }
  const path = args[idx + 1];
  if (!existsSync(path)) {
    return { error: `文件不存在: ${path}` };
  }
  return { text: readFileSync(path, 'utf8').trim() };
}

export function collectPublishPayload(args, publishCmd) {
  const subIdx = args.indexOf('--subreddit');
  if (subIdx === -1 || !args[subIdx + 1]) {
    return { error: '缺少 --subreddit' };
  }
  const subreddit = args[subIdx + 1].replace(/^r\//i, '');

  let title = '';
  let body = '';
  const titleFile = readFileArg(args, '--title-file');
  if (titleFile.error) {
    return titleFile;
  }
  title = titleFile.text;

  const bodyFile = readFileArg(args, '--body-file');
  if (!bodyFile.error) {
    body = bodyFile.text;
  }

  const titleInline = readFileArg(args, '--title');
  if (!titleInline.error && !title) {
    title = titleInline.text;
  }

  const bodyInline = readFileArg(args, '--body');
  if (!bodyInline.error && !body) {
    body = bodyInline.text;
  }

  if (publishCmd === 'submit-link' && !args.includes('--url')) {
    return { error: 'submit-link 需要 --url' };
  }

  return { subreddit, title, body, publishCmd };
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * @param {{ subreddit: string, title: string, body: string, publishCmd?: string }} payload
 */
export function validateRedditPublish(payload) {
  const issues = [];
  const allowTest = process.env.REDDIT_ALLOW_TEST_SUBREDDIT === 'true';

  if (!allowTest && TEST_SUBREDDITS.has(payload.subreddit.toLowerCase())) {
    issues.push(`测试版块 r/${payload.subreddit} 已拦截（调试可设 REDDIT_ALLOW_TEST_SUBREDDIT=true）`);
  }

  const combined = `${payload.title}\n${payload.body}`;
  for (const pattern of TEST_PATTERNS) {
    if (pattern.test(combined)) {
      issues.push(`含测试文案（${pattern.source}）`);
    }
  }

  if (/#[\w\u4e00-\u9fff]+/u.test(combined)) {
    issues.push('正文/标题含 Hashtag（#标签）');
  }

  if ((payload.title || '').length < 15) {
    issues.push(`标题过短（${(payload.title || '').length} 字，需 ≥15）`);
  }

  const bodyLen = (payload.body || '').length;
  const words = wordCount(payload.body || '');
  const cmd = payload.publishCmd ?? 'submit-text';
  if (cmd === 'submit-text' && bodyLen < 200 && words < 40) {
    issues.push(`正文过短（${bodyLen} 字 / ${words} 词，需 ≥200 字或 ≥40 词）`);
  }

  return { ok: issues.length === 0, issues };
}

export function formatValidationReport(result, payload) {
  const lines = [
    '=== Reddit 发布质量检查 ===',
    `subreddit: r/${payload.subreddit}`,
    `标题长度: ${(payload.title || '').length}`,
    `正文长度: ${(payload.body || '').length} 字 / ${wordCount(payload.body || '')} 词`,
    result.ok ? '结果: ✅ 通过' : `结果: ❌ 未通过\n- ${result.issues.join('\n- ')}`,
  ];
  return lines.join('\n');
}

/**
 * @param {{ title: string, body: string, subreddit: string }} ctx
 */
export function validatePublish(ctx) {
  const result = validateRedditPublish({
    subreddit: ctx.subreddit,
    title: ctx.title,
    body: ctx.body,
    publishCmd: 'submit-text',
  });
  return result.issues;
}
