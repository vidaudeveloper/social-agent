#!/usr/bin/env node
/**
 * 小红书探索报告 CLI — 把 xhs-explore 拉到的分析沉淀到知识库，供下次创作引用。
 *
 * 命令:
 *   save-raw      保存 search-feeds / list-feeds 原始 JSON
 *   save-details  追加/写入 get-feed-detail 结果
 *   save-insights 写入 Agent 手写 insights（可选，覆盖自动字段）
 *   build         从 raw/details 生成 insights + HTML + 创作参考.md
 *   list          列出知识库话题
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  topicSlug,
  topicDir,
  metaPath,
  rawPath,
  detailsPath,
  insightsPath,
  reportHtmlPath,
  creativeRefPath,
  latestIndexPath,
  knowledgeXhsDir,
  formatBeijingTime,
  formatBeijingDate,
} from './lib/paths.mjs';
import {
  extractFeedsFromRaw,
  extractDetailsList,
  normalizeDetail,
} from './lib/normalize.mjs';
import { buildInsights, mergeInsights } from './lib/insights.mjs';
import { writeReportHtml } from './lib/report-html.mjs';
import { writeCreativeRefMd } from './lib/creative-ref.mjs';

const USAGE = `Xiaohongshu Research CLI

命令:
  save-raw       --topic <slug> --in <search.json> [--keyword <kw>]
  save-details   --topic <slug> --in <detail.json> [--append]
  save-insights  --topic <slug> --in <insights.json>
  build          --topic <slug> [--keyword <kw>] [--title <报表标题>]
  list

示例:
  npm run xhs:research -- save-raw --topic 春招攻略 --in raw.json --keyword 春招
  npm run xhs:research -- save-details --topic 春招攻略 --in detail1.json --append
  npm run xhs:research -- build --topic 春招攻略 --keyword 春招
`;

/**
 * @param {string[]} argv
 * @returns {Record<string, string | boolean>}
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
 * @returns {unknown}
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * @param {string} path
 * @param {unknown} data
 */
function writeJson(path, data) {
  mkdirSync(dirnameSafe(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * @param {string} path
 * @returns {string}
 */
function dirnameSafe(path) {
  return join(path, '..');
}

/**
 * @param {string} slug
 * @param {Record<string, unknown>} patch
 */
function upsertMeta(slug, patch) {
  const path = metaPath(slug);
  /** @type {Record<string, unknown>} */
  let meta = {};
  if (existsSync(path)) meta = /** @type {Record<string, unknown>} */ (readJson(path));
  meta = {
    ...meta,
    slug,
    updatedAt: formatBeijingTime(),
    ...patch,
  };
  if (!meta.createdAt) meta.createdAt = formatBeijingTime();
  writeJson(path, meta);
  return meta;
}

/**
 * @param {string} slug
 * @param {Record<string, unknown>} meta
 * @param {Record<string, unknown>} insights
 */
function writeLatestIndex(slug, meta, insights) {
  writeJson(latestIndexPath(), {
    slug,
    updatedAt: formatBeijingTime(),
    date: formatBeijingDate(),
    keyword: meta.keyword || '',
    reportHtml: reportHtmlPath(slug),
    creativeRef: creativeRefPath(slug),
    insights: insightsPath(slug),
    sampleSize: insights.sampleSize || 0,
  });
}

function cmdSaveRaw(opts) {
  const topic = String(opts.topic || '');
  const inPath = String(opts.in || '');
  if (!topic || !inPath) {
    console.error('需要 --topic 与 --in');
    process.exit(2);
  }
  const slug = topicSlug(topic);
  const raw = readJson(inPath);
  writeJson(rawPath(slug), raw);
  const feeds = extractFeedsFromRaw(raw);
  const keyword = String(opts.keyword || topic);
  upsertMeta(slug, {
    keyword,
    rawFeedCount: feeds.length,
    stage: 'raw',
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        slug,
        path: rawPath(slug),
        feedCount: feeds.length,
      },
      null,
      2,
    ),
  );
}

function cmdSaveDetails(opts) {
  const topic = String(opts.topic || '');
  const inPath = String(opts.in || '');
  if (!topic || !inPath) {
    console.error('需要 --topic 与 --in');
    process.exit(2);
  }
  const slug = topicSlug(topic);
  const incoming = readJson(inPath);
  let newNotes = extractDetailsList(incoming);
  if (!newNotes.length) {
    // 兼容 CLI 直接吐整包 { note, comments }
    newNotes = [normalizeDetail(/** @type {Record<string, unknown>} */ (incoming))];
  }

  /** @type {Record<string, unknown>[]} */
  let existing = [];
  if (opts.append && existsSync(detailsPath(slug))) {
    const store = /** @type {Record<string, unknown>} */ (readJson(detailsPath(slug)));
    existing = extractDetailsList(store);
  }

  const byId = new Map();
  /** @type {Record<string, unknown>[]} */
  const noId = [];
  for (const n of [...existing, ...newNotes]) {
    if (n.noteId) byId.set(String(n.noteId), n);
    else noId.push(n);
  }
  const uniq = [...byId.values(), ...noId];

  writeJson(detailsPath(slug), {
    updatedAt: formatBeijingTime(),
    count: uniq.length,
    notes: uniq,
  });
  upsertMeta(slug, { detailCount: uniq.length, stage: 'details' });
  console.log(
    JSON.stringify(
      {
        ok: true,
        slug,
        path: detailsPath(slug),
        detailCount: uniq.length,
      },
      null,
      2,
    ),
  );
}

function cmdSaveInsights(opts) {
  const topic = String(opts.topic || '');
  const inPath = String(opts.in || '');
  if (!topic || !inPath) {
    console.error('需要 --topic 与 --in');
    process.exit(2);
  }
  const slug = topicSlug(topic);
  const manual = /** @type {Record<string, unknown>} */ (readJson(inPath));
  writeJson(insightsPath(slug), {
    ...manual,
    source: 'manual',
    slug,
    updatedAt: formatBeijingTime(),
  });
  upsertMeta(slug, { stage: 'insights', hasManualInsights: true });
  console.log(JSON.stringify({ ok: true, slug, path: insightsPath(slug) }, null, 2));
}

function cmdBuild(opts) {
  const topic = String(opts.topic || '');
  if (!topic) {
    console.error('需要 --topic');
    process.exit(2);
  }
  const slug = topicSlug(topic);
  const dir = topicDir(slug);
  if (!existsSync(dir)) {
    console.error(`话题目录不存在: ${dir}（先 save-raw / save-details）`);
    process.exit(2);
  }

  /** @type {Record<string, unknown>} */
  let meta = existsSync(metaPath(slug))
    ? /** @type {Record<string, unknown>} */ (readJson(metaPath(slug)))
    : { slug };
  const keyword = String(opts.keyword || meta.keyword || topic);
  meta = upsertMeta(slug, { keyword, stage: 'build' });

  let details = [];
  if (existsSync(detailsPath(slug))) {
    details = extractDetailsList(readJson(detailsPath(slug)));
  } else if (existsSync(rawPath(slug))) {
    // 只有搜索结果时也可用粗粒度字段出报告
    details = extractFeedsFromRaw(readJson(rawPath(slug))).map((f) => ({
      ...f,
      text: '',
      body: '',
      desc: '',
      tags: [],
      imageCount: 0,
    }));
  }

  if (!details.length) {
    console.error('没有可用的 details/raw 数据');
    process.exit(2);
  }

  let insights = buildInsights(details, { topic: slug, keyword });
  if (existsSync(insightsPath(slug))) {
    const manual = /** @type {Record<string, unknown>} */ (readJson(insightsPath(slug)));
    // 若已有 notes 且带 agentNotes / doList，合并保留
    insights = mergeInsights(insights, manual);
  }
  insights.updatedAt = formatBeijingTime();
  writeJson(insightsPath(slug), insights);

  const title = String(opts.title || `小红书竞品报告 · ${keyword || slug}`);
  const htmlOut = reportHtmlPath(slug);
  const mdOut = creativeRefPath(slug);
  writeReportHtml({ title, slug, keyword, insights, outPath: htmlOut });
  writeCreativeRefMd({
    slug,
    keyword,
    insights,
    outPath: mdOut,
    reportHtmlRel: `${slug}_竞品报告.html`,
  });
  writeLatestIndex(slug, meta, insights);

  console.log(
    JSON.stringify(
      {
        ok: true,
        slug,
        paths: {
          meta: metaPath(slug),
          insights: insightsPath(slug),
          reportHtml: htmlOut,
          creativeRef: mdOut,
          latest: latestIndexPath(),
        },
        sampleSize: insights.sampleSize,
      },
      null,
      2,
    ),
  );
}

function cmdList() {
  if (!existsSync(knowledgeXhsDir)) {
    console.log(JSON.stringify({ ok: true, topics: [], dir: knowledgeXhsDir }, null, 2));
    return;
  }
  const topics = readdirSync(knowledgeXhsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const slug = d.name;
      const meta = existsSync(metaPath(slug))
        ? /** @type {Record<string, unknown>} */ (readJson(metaPath(slug)))
        : {};
      return {
        slug,
        keyword: meta.keyword || '',
        updatedAt: meta.updatedAt || '',
        hasCreativeRef: existsSync(creativeRefPath(slug)),
        hasReport: existsSync(reportHtmlPath(slug)),
      };
    });
  const latest = existsSync(latestIndexPath()) ? readJson(latestIndexPath()) : null;
  console.log(JSON.stringify({ ok: true, topics, latest }, null, 2));
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === '-h' || cmd === '--help') {
    console.log(USAGE);
    process.exit(cmd ? 0 : 1);
  }
  const opts = parseArgs(rest);
  switch (cmd) {
    case 'save-raw':
      cmdSaveRaw(opts);
      break;
    case 'save-details':
      cmdSaveDetails(opts);
      break;
    case 'save-insights':
      cmdSaveInsights(opts);
      break;
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
