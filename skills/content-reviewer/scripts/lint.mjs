#!/usr/bin/env node
/**
 * content-reviewer 硬规则 lint CLI
 * stdout: JSON { ok, platform, display_name, findings, rubrics }
 */
import { existsSync, readFileSync } from 'fs';
import { loadPlatformRules } from './lib/load-rules.mjs';
import { extractTitleAndBody, matchPattern, noTestMarkers } from './lib/common.mjs';
import * as xhs from './lib/xhs.mjs';
import * as zhihu from './lib/zhihu.mjs';
import * as textLimits from './lib/text-limits.mjs';
import { validatePublish as validateReddit } from './lib/reddit.mjs';

const HANDLERS = {
  'common.noTestMarkers': (ctx) => noTestMarkers(ctx.combined),
  'xhs.titleLength': (ctx, params) => xhs.titleLength(ctx.title, params?.max ?? 20),
  'xhs.hashtagsLastLine': (ctx) => xhs.hashtagsLastLine(ctx.body),
  'xhs.forbiddenImageExt': (ctx, params) =>
    xhs.forbiddenImageExt(ctx.images, params?.blocked),
  'limits.titleMaxLength': (ctx, params) =>
    textLimits.titleMaxLength(ctx.title, params?.max ?? 0, params),
  'limits.bodyMaxLength': (ctx, params) =>
    textLimits.bodyMaxLength(ctx.body, params?.max ?? 0),
  'limits.hashtagCount': (ctx, params) => textLimits.hashtagCount(ctx.body, params ?? {}),
  'limits.imageCountMax': (ctx, params) =>
    textLimits.imageCountMax(ctx.images, params?.max ?? 0),
  'zhihu.noMarkdownHeaders': (ctx) => zhihu.noMarkdownHeaders(ctx.content),
  'zhihu.noPipeTables': (ctx) => zhihu.noPipeTables(ctx.content),
  'zhihu.noBlockquotes': (ctx) => zhihu.noBlockquotes(ctx.content),
  'reddit.validatePublish': (ctx) => {
    if (!ctx.subreddit) {
      return ['Reddit 审核需要 --subreddit'];
    }
    return validateReddit({
      subreddit: ctx.subreddit,
      title: ctx.title,
      body: ctx.body,
    });
  },
};

function parseArgs(argv) {
  const out = {
    platform: '',
    file: '',
    title: '',
    titleFile: '',
    subreddit: '',
    carrier: '',
    images: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--platform' && argv[i + 1]) {
      out.platform = argv[++i];
    } else if (arg === '--file' && argv[i + 1]) {
      out.file = argv[++i];
    } else if (arg === '--title' && argv[i + 1]) {
      out.title = argv[++i];
    } else if (arg === '--title-file' && argv[i + 1]) {
      out.titleFile = argv[++i];
    } else if (arg === '--subreddit' && argv[i + 1]) {
      out.subreddit = argv[++i].replace(/^r\//i, '');
    } else if (arg === '--carrier' && argv[i + 1]) {
      out.carrier = argv[++i];
    } else if (arg === '--images' && argv[i + 1]) {
      out.images.push(argv[++i]);
    } else if (arg === '--help' || arg === '-h') {
      out.help = true;
    }
  }
  return out;
}

function printHelp() {
  console.log(`content-reviewer lint

用法:
  npm run review:lint -- --platform <id> --file <path> [选项]

选项:
  --platform      平台 ID（xiaohongshu / zhihu / reddit / ...）
  --file          文稿绝对路径
  --title         标题（可选，默认从首行 # 解析）
  --title-file    标题文件（Reddit 等场景）
  --subreddit     Reddit 版块名
  --carrier       内容载体（如「短视频（主推）」；默认仅检查 primary 载体）
  --images        配图路径（可多次传入）

输出: JSON（findings + rubrics 待 Agent 检查的 rubric 列表）`);
}

function runCheck(check, ctx) {
  if (check.type === 'rubric') {
    return { skipped: true, rubric: true };
  }

  if (check.type === 'pattern') {
    const issues = matchPattern(check.pattern, ctx.combined, check.id);
    return { issues };
  }

  if (check.type !== 'script' || !check.handler) {
    return { issues: [`未实现的检查类型: ${check.type}`] };
  }

  const fn = HANDLERS[check.handler];
  if (!fn) {
    return { issues: [`未知 handler: ${check.handler}`] };
  }

  return { issues: fn(ctx, check.params) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.platform || !args.file) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (!existsSync(args.file)) {
    console.error(JSON.stringify({ ok: false, error: `文件不存在: ${args.file}` }));
    process.exit(1);
  }

  const content = readFileSync(args.file, 'utf8');
  const parsed = extractTitleAndBody(content);
  let title = args.title || parsed.title;
  if (args.titleFile && existsSync(args.titleFile)) {
    title = readFileSync(args.titleFile, 'utf8').trim();
  }

  const body = parsed.body || content;
  const combined = `${title}\n${body}`;

  const rules = loadPlatformRules(args.platform, { carrier: args.carrier || undefined });
  const ctx = {
    content,
    title,
    body,
    combined,
    images: args.images,
    subreddit: args.subreddit,
  };

  const findings = [];
  const rubrics = [];

  for (const check of rules.checks) {
    if (check.type === 'rubric') {
      rubrics.push({
        id: check.id,
        severity: check.severity,
        prompt: check.prompt,
        source: check.source,
      });
      continue;
    }

    const result = runCheck(check, ctx);
    if (result.skipped) continue;

    const issues = result.issues ?? [];
    findings.push({
      id: check.id,
      severity: check.severity,
      type: check.type,
      pass: issues.length === 0,
      messages: issues,
      source: check.source,
    });
  }

  const hasError = findings.some((f) => !f.pass && f.severity === 'error');
  const output = {
    ok: !hasError,
    platform: rules.platform,
    display_name: rules.display_name,
    file: args.file,
    title,
    findings,
    rubrics,
    summary: {
      error: findings.filter((f) => !f.pass && f.severity === 'error').length,
      warn: findings.filter((f) => !f.pass && f.severity === 'warn').length,
      info: findings.filter((f) => !f.pass && f.severity === 'info').length,
      rubric_pending: rubrics.length,
    },
  };

  console.log(JSON.stringify(output, null, 2));
  process.exit(hasError ? 1 : 0);
}

main();
