#!/usr/bin/env node
/**
 * 小红书「发布后」作品复盘 — 把已分析好的 JSON 落成 HTML + 下次创作参考.md
 *
 * 命令:
 *   build --in <report.json> [--account <昵称>] [--date YYYY-MM-DD]
 *   list
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  accountSlug,
  accountDir,
  reportHtmlPath,
  reportJsonPath,
  nextRefPath,
  latestIndexPath,
  analyticsXhsDir,
  formatBeijingTime,
  formatBeijingDate,
} from './lib/paths.mjs';
import { writePostPublishReportHtml } from './lib/report-html.mjs';
import { writeNextCreativeRef } from './lib/next-ref.mjs';

const USAGE = `Xiaohongshu Post-publish Analytics CLI

命令:
  build  --in <report.json> [--account <昵称>] [--date YYYY-MM-DD]
  list

report.json 结构见 skills/analytics/xhs-post-analytics/references/report-schema.md
`;

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--') && a.includes('=')) {
      const [k, v] = a.slice(2).split('=');
      opts[k] = v;
    } else if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        opts[key] = next;
        i++;
      } else {
        opts[key] = true;
      }
    }
  }
  return opts;
}

/**
 * @param {string} path
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * @param {string} path
 * @param {unknown} data
 */
function writeJson(path, data) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function cmdBuild(opts) {
  const inPath = String(opts.in || '');
  if (!inPath) {
    console.error('需要 --in <report.json>');
    process.exit(2);
  }
  const report = /** @type {Record<string, unknown>} */ (readJson(inPath));
  const account = /** @type {Record<string, unknown>} */ (report.account || {});
  const nick = String(opts.account || account.nickname || 'account');
  const slug = accountSlug(nick);
  const dateKey = String(opts.date || formatBeijingDate());

  report.generatedAt = report.generatedAt || formatBeijingTime();
  report.title = report.title || '小红书账号作品数据全分析';

  const htmlOut = reportHtmlPath(slug, dateKey);
  const jsonOut = reportJsonPath(slug, dateKey);
  const mdOut = nextRefPath(slug, dateKey);
  mkdirSync(accountDir(slug), { recursive: true });

  writeJson(jsonOut, report);
  writePostPublishReportHtml({ report, outPath: htmlOut });
  writeNextCreativeRef({
    report,
    outPath: mdOut,
    reportHtmlName: `${dateKey}_作品复盘.html`,
  });

  writeJson(latestIndexPath(), {
    type: 'post-publish',
    account: nick,
    accountSlug: slug,
    date: dateKey,
    updatedAt: formatBeijingTime(),
    reportHtml: htmlOut,
    nextRef: mdOut,
    reportJson: jsonOut,
    postCount: Array.isArray(report.posts) ? report.posts.length : 0,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        accountSlug: slug,
        date: dateKey,
        paths: {
          reportHtml: htmlOut,
          reportJson: jsonOut,
          nextRef: mdOut,
          latest: latestIndexPath(),
        },
      },
      null,
      2,
    ),
  );
}

function cmdList() {
  if (!existsSync(analyticsXhsDir)) {
    console.log(JSON.stringify({ ok: true, accounts: [], dir: analyticsXhsDir }, null, 2));
    return;
  }
  const accounts = readdirSync(analyticsXhsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const files = readdirSync(join(analyticsXhsDir, d.name)).filter((f) =>
        f.endsWith('_作品复盘.html'),
      );
      return { accountSlug: d.name, reports: files };
    });
  const latest = existsSync(latestIndexPath()) ? readJson(latestIndexPath()) : null;
  console.log(JSON.stringify({ ok: true, accounts, latest }, null, 2));
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === '-h' || cmd === '--help') {
    console.log(USAGE);
    process.exit(cmd ? 0 : 1);
  }
  const opts = parseArgs(rest);
  switch (cmd) {
    case 'build':
      cmdBuild(opts);
      break;
    case 'list':
      cmdList();
      break;
    default:
      console.error(`未知命令: ${cmd}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main();
