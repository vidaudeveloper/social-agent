#!/usr/bin/env node
/**
 * 从创作者中心导出 xlsx（或已有文件）生成发布复盘 HTML
 *
 *   npm run xhs:stats -- archive --in "D:\GoogleDownload\笔记列表明细表 (1).xlsx" --account "TK广告运营"
 *   npm run xhs:stats -- archive --days 30 --account "TK广告运营"
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
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
import { buildInsightsFromExport } from './lib/insights.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const parseScript = join(scriptsDir, 'parse_export.py');
/** skills/analytics/xhs-post-analytics/scripts → 仓库根 */
const profileRoot = resolve(scriptsDir, '../../../..');
const xhsDir = join(profileRoot, 'skills', 'publish', 'xiaohongshu');
const cliPy = join(xhsDir, 'scripts', 'cli.py');

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
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
 * @param {string} xlsxPath
 */
function parseExportFile(xlsxPath) {
  const r = spawnSync(
    'uv',
    ['run', '--with', 'openpyxl', 'python', parseScript, '--in', xlsxPath],
    {
      encoding: 'utf8',
      cwd: xhsDir,
      maxBuffer: 20 * 1024 * 1024,
      env: { ...process.env, PYTHONUTF8: '1' },
    },
  );
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || '').trim();
    throw new Error(err || `parse_export.py exit ${r.status}`);
  }
  const data = JSON.parse((r.stdout || '').trim());
  if (!data.ok) throw new Error(data.error || 'parse failed');
  return data;
}

/**
 * 调用 publish CLI 自动点「导出数据」
 * @param {Record<string, string | boolean>} opts
 */
function exportViaCli(opts) {
  const args = ['export-note-data'];
  if (opts.days) args.push('--days', String(opts.days));
  if (opts['start-date']) args.push('--start-date', String(opts['start-date']));
  if (opts['end-date']) args.push('--end-date', String(opts['end-date']));
  if (opts['out-dir']) args.push('--out-dir', String(opts['out-dir']));
  if (opts.timeout) args.push('--timeout', String(opts.timeout));

  console.error(`[archive] 调用导出: python ${cliPy} ${args.join(' ')}`);
  const r = spawnSync('uv', ['run', 'python', cliPy, ...args], {
    encoding: 'utf8',
    cwd: join(xhsDir, 'scripts'),
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, PYTHONUTF8: '1' },
  });
  const out = (r.stdout || '').trim();
  let data;
  try {
    data = JSON.parse(out);
  } catch {
    throw new Error(
      (r.stderr || out || `export-note-data exit ${r.status}`).slice(0, 2000),
    );
  }
  if (!data.ok || !data.path) {
    throw new Error(data.error || JSON.stringify(data));
  }
  return data;
}

/**
 * @param {string[]} argv
 */
export function runArchive(argv = []) {
  const opts = parseArgs(argv);
  let inPath = String(opts.in || '');
  /** @type {Record<string, unknown> | null} */
  let exportMeta = null;

  if (!inPath) {
    exportMeta = exportViaCli(opts);
    inPath = String(exportMeta.path);
  }
  if (!existsSync(inPath)) {
    throw new Error(`文件不存在: ${inPath}`);
  }

  console.error(`[archive] 解析导出表: ${inPath}`);
  const parsed = parseExportFile(inPath);
  const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
  const summary = parsed.summary || {};

  const nick = String(opts.account || 'account');
  const slug = accountSlug(nick);
  const dateKey = String(opts.date || formatBeijingDate());

  const { findings, suggestions } = buildInsightsFromExport({
    posts,
    summary,
    account: { nickname: nick },
  });

  const period = {
    sourceFile: inPath,
    ...(exportMeta?.startDate ? { startDate: exportMeta.startDate } : {}),
    ...(exportMeta?.endDate ? { endDate: exportMeta.endDate } : {}),
  };

  const report = {
    title: '小红书账号作品数据全分析',
    generatedAt: formatBeijingTime(),
    dataNote: '注：互动与曝光等数据来源于创作者中心「内容分析 → 导出数据」xlsx',
    account: {
      nickname: nick,
    },
    period,
    summary,
    posts,
    findings,
    suggestions,
  };

  mkdirSync(accountDir(slug), { recursive: true });
  const htmlOut = reportHtmlPath(slug, dateKey);
  const jsonOut = reportJsonPath(slug, dateKey);
  const mdOut = nextRefPath(slug, dateKey);

  writeFileSync(jsonOut, JSON.stringify(report, null, 2), 'utf8');
  writePostPublishReportHtml({ report, outPath: htmlOut });
  writeNextCreativeRef({
    report,
    outPath: mdOut,
    reportHtmlName: `${dateKey}_作品复盘.html`,
  });

  mkdirSync(analyticsXhsDir, { recursive: true });
  writeFileSync(
    latestIndexPath(),
    JSON.stringify(
      {
        type: 'post-publish',
        source: 'creator-export-xlsx',
        account: nick,
        accountSlug: slug,
        date: dateKey,
        updatedAt: formatBeijingTime(),
        reportHtml: htmlOut,
        nextRef: mdOut,
        reportJson: jsonOut,
        postCount: posts.length,
        summary,
        bestTitle: findings.best?.title || '',
      },
      null,
      2,
    ),
    'utf8',
  );

  const result = {
    ok: true,
    accountSlug: slug,
    date: dateKey,
    summary,
    findings: { best: findings.best, issueCount: findings.issues.length },
    suggestionCount: suggestions.length,
    paths: {
      reportHtml: htmlOut,
      reportJson: jsonOut,
      nextRef: mdOut,
      latest: latestIndexPath(),
    },
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
