#!/usr/bin/env node
/**
 * YouTube explore pipeline v2
 * Usage:
 *   node run-pipeline.mjs --topic tiktok-shop --keyword "TikTok Shop seller guide 2026" --top 5
 *   node run-pipeline.mjs --topic tiktok-shop --from content/知识库/youtube/tiktok-shop/raw.json
 *   node run-pipeline.mjs --topic tiktok-shop --keyword "..." --fallback   # yt-dlp discover
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { discoverToRaw } from './lib/discover-ytdlp.mjs';
import { scoreVideos } from './lib/score.mjs';
import { appendPhrasesFromScriptsRaw } from './lib/phrases-csv.mjs';
import { buildReportFromScriptsRaw } from './lib/report-boss-html.mjs';
import {
  topicSlug,
  topicDir,
  rawPath,
  rankedPath,
  reportHtmlPath,
  scriptsRawPath,
  phrasesCsvPath,
  formatBeijingTime,
} from './lib/paths.mjs';

const scriptsDir = import.meta.dirname;
const cliPath = join(scriptsDir, 'cli.mjs');

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const opts = { top: '5' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--topic') opts.topic = argv[++i] ?? '';
    else if (a === '--keyword' || a === '-k') {
      const parts = [];
      while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        parts.push(argv[++i]);
      }
      if (parts.length) opts.keyword = parts.join(' ');
    } else if (a === '--top') opts.top = argv[++i] ?? '5';
    else if (a === '--product') opts.product = argv[++i] ?? '';
    else if (a === '--from') opts.from = argv[++i] ?? '';
    else if (a === '--lang') opts.lang = argv[++i] ?? 'en,en-US';
    else if (a === '--fallback') opts.fallback = true;
    else if (a === '--min-duration') opts['min-duration'] = argv[++i] ?? '300';
    else if (a === '--max-duration') opts['max-duration'] = argv[++i] ?? '1200';
  }
  return opts;
}

/**
 * @param {string} rankedFile
 * @param {string} lang
 * @param {string} slug
 * @param {string} topic
 * @param {string} product
 * @returns {string} scripts_raw path
 */
function extractAndMergeRaw(rankedFile, lang, slug, topic, product) {
  const extractR = spawnSync(
    'node',
    [
      cliPath,
      'extract',
      '--from',
      rankedFile,
      '--lang',
      lang,
      '--merge-raw',
      '--slug',
      slug,
      '--topic',
      topic,
      '--product',
      product,
    ],
    { encoding: 'utf8', shell: true },
  );
  if (extractR.stdout) console.log(extractR.stdout.trim());
  if (extractR.status !== 0 && extractR.stderr) console.error(extractR.stderr);

  try {
    const payload = JSON.parse(extractR.stdout || '{}');
    return String(payload.scriptsRaw || scriptsRawPath(slug));
  } catch {
    return scriptsRawPath(slug);
  }
}

const opts = parseArgs(process.argv.slice(2));

if (!opts.topic) {
  console.error('缺少 --topic <slug>（如 tiktok-shop）');
  process.exit(1);
}

const slug = topicSlug(String(opts.topic));
const topic = String(opts.topic);
const product = String(opts.product || slug);
const top = parseInt(String(opts.top), 10);
const minDuration = parseInt(String(opts['min-duration'] || '300'), 10);
const maxDuration = parseInt(String(opts['max-duration'] || '1200'), 10);
const lang = String(opts.lang || 'en,en-US');
const dir = topicDir(slug);

mkdirSync(dir, { recursive: true });

console.log(`\n=== YouTube Explore v2 ===`);
console.log(`话题: ${topic} (${slug})`);
console.log(`产品: ${product}`);
console.log(`时间: ${formatBeijingTime()}（北京时间）\n`);

/** @type {string} */
let rawFile = String(opts.from || '');
let dataSource = 'TubePilot MCP（Agent 提供 raw.json）';

if (!rawFile) {
  const defaultRaw = rawPath(slug);
  if (existsSync(defaultRaw)) {
    rawFile = defaultRaw;
    dataSource = '已有 raw.json';
  } else if (opts.fallback) {
    if (!opts.keyword) {
      console.error('--fallback 需要 --keyword');
      process.exit(1);
    }
    console.log('[1/5] yt-dlp 补位 discover...');
    dataSource = 'yt-dlp（fallback）';
    const raw = discoverToRaw(String(opts.keyword));
    rawFile = defaultRaw;
    writeFileSync(rawFile, JSON.stringify({ ...raw, topic, keyword: opts.keyword }, null, 2), 'utf8');
    console.log(`  → ${rawFile} (${raw.videos?.length ?? 0} 条)`);
  } else {
    console.error(
      '未找到 raw.json。请先由 Agent 通过 TubePilot MCP 保存至：\n' +
        `  ${rawPath(slug)}\n` +
        '或使用 --from <path> / --fallback --keyword "..."',
    );
    process.exit(1);
  }
} else {
  console.log(`[1/5] 使用已有 raw: ${rawFile}`);
}

console.log('[2/5] ER 分级...');
const raw = JSON.parse(readFileSync(rawFile, 'utf8'));
const ranked = {
  scoredAt: new Date().toISOString(),
  source: rawFile,
  topic,
  slug,
  product,
  keyword: raw.keyword || opts.keyword || topic,
  filters: { minDuration, maxDuration, top },
  videos: scoreVideos(raw, { top, minDuration, maxDuration }),
};
const rankedFile = rankedPath(slug);
writeFileSync(rankedFile, JSON.stringify(ranked, null, 2), 'utf8');
console.log(`  Top ${ranked.videos.length} → ${rankedFile}`);

console.log('[3/5] 补充视频简介...');
spawnSync('node', [join(scriptsDir, 'enrich-ranked.mjs'), rankedFile], {
  stdio: 'inherit',
  shell: true,
});

console.log('[4/5] 抽字幕 + 组装 scripts_raw.json...');
const rawOut = extractAndMergeRaw(rankedFile, lang, slug, topic, product);
console.log(`  → ${rawOut}`);

console.log('[5/5] HTML 报告 + 金句库...');
const htmlOut = reportHtmlPath(slug);
buildReportFromScriptsRaw(rawOut, htmlOut, { topic, product, slug, dataSource });
const scriptsRaw = JSON.parse(readFileSync(rawOut, 'utf8'));
const phrases = appendPhrasesFromScriptsRaw(scriptsRaw, topic, product);

console.log('\n✅ 完成');
console.log(
  JSON.stringify(
    {
      topic,
      slug,
      dataSource,
      reportHtml: htmlOut,
      scriptsRaw: rawOut,
      ranked: rankedFile,
      phrasesCsv: phrasesCsvPath(),
      phrasesAppended: phrases.appended,
    },
    null,
    2,
  ),
);
