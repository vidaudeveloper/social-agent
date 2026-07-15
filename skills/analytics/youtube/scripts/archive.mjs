#!/usr/bin/env node
/**
 * 拉取自家频道 Analytics 并落盘 HTML/JSON
 *
 * 用法（经包装）:
 *   npm run youtube:stats -- archive [--days 30] [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD]
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  channelSlug,
  channelDir,
  reportHtmlPath,
  reportJsonPath,
  latestIndexPath,
  formatBeijingTime,
  formatBeijingDate,
  defaultDateRange,
  analyticsYtDir,
} from './lib/paths.mjs';
import { writeYoutubeReportHtml } from './lib/report-html.mjs';

const profileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const cliRoot = resolve(
  process.env.YOUTUBE_ANALYTICS_CLI_ROOT || join(profileRoot, 'tool', 'youtube-analytics-cli'),
);
const cliEntry = join(cliRoot, 'node_modules', 'youtube-analytics-cli', 'dist', 'index.js');

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
 * @param {string[]} args
 */
function runYt(args) {
  if (!existsSync(cliEntry)) {
    throw new Error(`youtube-analytics-cli 未找到: ${cliEntry}；请先 npm run youtube:stats-setup`);
  }
  const r = spawnSync(process.execPath, [cliEntry, '--format', 'compact', ...args], {
    encoding: 'utf8',
    env: process.env,
    cwd: profileRoot,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.status !== 0) {
    const errText = (r.stderr || r.stdout || '').trim();
    throw new Error(errText || `youtube-analytics-cli exit ${r.status}`);
  }
  const out = (r.stdout || '').trim();
  if (!out) throw new Error(`空响应: ${args.join(' ')}`);
  return JSON.parse(out);
}

/**
 * @param {Record<string, unknown>} table
 */
function rowsToObjects(table) {
  const headers = Array.isArray(table.columnHeaders)
    ? table.columnHeaders.map((h) => String(/** @type {any} */ (h).name))
    : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  return rows.map((row) => {
    /** @type {Record<string, unknown>} */
    const obj = {};
    headers.forEach((name, i) => {
      obj[name] = Array.isArray(row) ? row[i] : undefined;
    });
    return obj;
  });
}

/**
 * @param {unknown[]} nums
 */
function sumField(rows, key) {
  return rows.reduce((acc, row) => acc + (Number(/** @type {any} */ (row)[key]) || 0), 0);
}

/**
 * @param {string[]} argv
 */
export function runArchive(argv = []) {
  const opts = parseArgs(argv);
  const daysN = Math.max(1, Number(opts.days || 30) || 30);
  const range = defaultDateRange(daysN);
  const startDate = String(opts['start-date'] || range.startDate);
  const endDate = String(opts['end-date'] || range.endDate);
  const dateKey = String(opts.date || formatBeijingDate());

  console.error(`[archive] 拉取频道 + ${startDate}~${endDate} Analytics…`);

  const channelRes = runYt(['channels']);
  const channelItem = Array.isArray(channelRes.items) ? channelRes.items[0] : null;
  if (!channelItem) throw new Error('未取到自家频道，请检查 OAuth / Test users');

  const snippet = /** @type {Record<string, unknown>} */ (channelItem.snippet || {});
  const stats = /** @type {Record<string, unknown>} */ (channelItem.statistics || {});
  const channel = {
    id: channelItem.id,
    title: snippet.title,
    customUrl: snippet.customUrl,
    description: snippet.description,
    publishedAt: snippet.publishedAt,
    subscriberCount: stats.subscriberCount,
    viewCount: stats.viewCount,
    videoCount: stats.videoCount,
  };

  const dayTable = runYt([
    'report',
    '--metrics',
    'views,likes,comments,shares,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost',
    '--start-date',
    startDate,
    '--end-date',
    endDate,
    '--dimensions',
    'day',
  ]);
  const days = rowsToObjects(dayTable);

  const videoTable = runYt([
    'report',
    '--metrics',
    'views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
    '--start-date',
    startDate,
    '--end-date',
    endDate,
    '--dimensions',
    'video',
    '--sort',
    '-views',
    '--max-results',
    '50',
  ]);
  const videoRows = rowsToObjects(videoTable);
  const videoIds = videoRows.map((r) => String(r.video || '')).filter(Boolean);

  /** @type {Map<string, Record<string, unknown>>} */
  const detailMap = new Map();
  if (videoIds.length) {
    const detailRes = runYt(['videos', videoIds.join(','), '--part', 'snippet,statistics,contentDetails']);
    for (const item of Array.isArray(detailRes.items) ? detailRes.items : []) {
      const sn = /** @type {Record<string, unknown>} */ (item.snippet || {});
      const st = /** @type {Record<string, unknown>} */ (item.statistics || {});
      detailMap.set(String(item.id), {
        title: sn.title,
        publishedAt: sn.publishedAt,
        publicViewCount: st.viewCount,
        publicLikeCount: st.likeCount,
        publicCommentCount: st.commentCount,
        duration: /** @type {any} */ (item.contentDetails || {}).duration,
      });
    }
  }

  const videos = videoRows.map((r) => {
    const id = String(r.video || '');
    const detail = detailMap.get(id) || {};
    return {
      id,
      title: detail.title || id,
      publishedAt: detail.publishedAt || '',
      views: r.views,
      likes: r.likes,
      comments: r.comments,
      estimatedMinutesWatched: r.estimatedMinutesWatched,
      averageViewDuration: r.averageViewDuration,
      averageViewPercentage: r.averageViewPercentage,
      publicViewCount: detail.publicViewCount,
      publicLikeCount: detail.publicLikeCount,
      publicCommentCount: detail.publicCommentCount,
      duration: detail.duration,
    };
  });

  const summary = {
    views: sumField(days, 'views'),
    likes: sumField(days, 'likes'),
    comments: sumField(days, 'comments'),
    shares: sumField(days, 'shares'),
    estimatedMinutesWatched: sumField(days, 'estimatedMinutesWatched'),
    subscribersGained: sumField(days, 'subscribersGained'),
    subscribersLost: sumField(days, 'subscribersLost'),
  };

  const slug = channelSlug(String(channel.customUrl || channel.title || channel.id));
  const report = {
    title: 'YouTube 频道作品复盘',
    generatedAt: formatBeijingTime(),
    period: { startDate, endDate, days: daysN },
    channel,
    summary,
    days,
    videos,
    dataNote:
      '数据来源：YouTube Data API v3 + YouTube Analytics API v2（Analytics 与公开统计口径可能略有差异）',
  };

  mkdirSync(channelDir(slug), { recursive: true });
  const htmlOut = reportHtmlPath(slug, dateKey);
  const jsonOut = reportJsonPath(slug, dateKey);
  writeFileSync(jsonOut, JSON.stringify(report, null, 2), 'utf8');
  writeYoutubeReportHtml({ report, outPath: htmlOut });

  const latest = {
    type: 'youtube-post-publish',
    channel: channel.title,
    channelId: channel.id,
    channelSlug: slug,
    date: dateKey,
    period: report.period,
    updatedAt: formatBeijingTime(),
    reportHtml: htmlOut,
    reportJson: jsonOut,
    videoCount: videos.length,
    summary,
  };
  mkdirSync(analyticsYtDir, { recursive: true });
  writeFileSync(latestIndexPath(), JSON.stringify(latest, null, 2), 'utf8');

  const result = {
    ok: true,
    channelSlug: slug,
    date: dateKey,
    period: report.period,
    summary,
    paths: {
      reportHtml: htmlOut,
      reportJson: jsonOut,
      latest: latestIndexPath(),
    },
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    runArchive(process.argv.slice(2));
  } catch (e) {
    console.error('[archive]', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
