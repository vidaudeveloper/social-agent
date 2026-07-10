#!/usr/bin/env node
/**
 * YouTube explore CLI — score | extract | research
 * Discover 由 TubePilot MCP 完成；yt-dlp 仅 --fallback（见 run-pipeline.mjs）
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { scoreVideos } from './lib/score.mjs';
import { extractSubtitlesYtdlp } from './lib/extract-ytdlp.mjs';
import { rebuildFromSegments } from './lib/sentence-rebuild.mjs';
import { buildScriptsRaw, writeScriptsRaw } from './lib/scripts-raw.mjs';
import { appendPhrasesFromScriptsRaw } from './lib/phrases-csv.mjs';
import { buildReportFromScriptsRaw } from './lib/report-boss-html.mjs';
import {
  extractScriptPath,
  hermesRoot,
  topicSlug,
  topicDir,
  rankedPath,
  rawPath,
  reportHtmlPath,
  scriptsRawPath,
  phrasesCsvPath,
} from './lib/paths.mjs';

const USAGE = `YouTube Explore CLI (v2)

命令:
  score       对 TubePilot 输出的 raw JSON 做 ER 分级与 Long-form 过滤
  extract     用 youtube-transcript-api 抽取字幕并按句重组（timed + sentences）
  research    从 ranked 批量 extract + 生成 scripts_raw + HTML 报告

score 参数:
  --in, -i <path>           TubePilot 原始 JSON（必填）
  --topic <slug>            话题目录（写入 知识库/youtube/{slug}/ranked.json）
  --out, -o <path>          自定义 ranked 输出路径
  --top <n>                 默认 5
  --min-duration <sec>      默认 300（5min）
  --max-duration <sec>      默认 1200（20min）

extract 参数:
  --video-id <id>           单个视频
  --from <ranked.json>      批量（ranked 列表）
  --lang <codes>            默认 en,en-US
  --merge-raw               与 --from 联用：输出 transcripts 到 stdout JSON
  --slug <slug>             写入 scripts_raw.json（需 --from）

research 参数:
  --from <ranked.json>      必填
  --topic <slug>            话题（默认从 ranked.topic）
  --product <name>          产品名（默认等于 topic）
  --lang <codes>            默认 en,en-US

管线（推荐）:
  npm run youtube:explore -- --topic <slug> --keyword "..." [--fallback]

配置: workspace/references/youtube-explore-setup.md
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
    if (a === '--top' || a === '--min-duration' || a === '--max-duration') {
      opts[a.slice(2)] = argv[++i] ?? '';
    } else if (a.startsWith('--') && a.includes('=')) {
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
    } else if (a.startsWith('-')) {
      const map = { i: 'in', o: 'out', k: 'keyword' };
      const key = map[a.slice(1)] || a.slice(1);
      opts[key] = argv[++i] ?? '';
    }
  }
  return opts;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * @param {string} videoId
 * @param {string} lang
 * @param {string} [outFile]
 */
function runExtractPy(videoId, lang, outFile) {
  const r = spawnSync(
    'uv',
    [
      'run',
      '--with',
      'youtube-transcript-api',
      'python',
      extractScriptPath,
      '--video-id',
      videoId,
      '--lang',
      lang,
      ...(outFile ? ['--out', outFile] : []),
    ],
    { encoding: 'utf8', shell: true },
  );

  if (r.status !== 0) {
    const ytdlp = extractSubtitlesYtdlp(videoId, lang.split(',')[0] || 'en');
    if (ytdlp?.fullText) {
      const ok = {
        videoId,
        language: lang.split(',')[0] || 'en',
        source: 'yt-dlp-subtitles',
        segments: ytdlp.segments,
        fullText: ytdlp.fullText,
        transcript_status: 'ok',
      };
      if (outFile) writeFileSync(outFile, JSON.stringify(ok, null, 2), 'utf8');
      return enrichTranscript(ok);
    }

    const fallback = {
      videoId,
      transcript_status: 'unavailable',
      error: (r.stderr || r.stdout || 'extract failed').trim(),
    };
    if (outFile) writeFileSync(outFile, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }

  const payload = outFile ? readJson(outFile) : JSON.parse(r.stdout || '{}');
  return enrichTranscript(payload);
}

/**
 * @param {Record<string, unknown>} transcript
 */
function enrichTranscript(transcript) {
  if (transcript.transcript_status !== 'ok') return transcript;
  const { timed, sentences } = rebuildFromSegments(
    /** @type {{ text: string, start?: number }[]} */ (transcript.segments || []),
  );
  return {
    ...transcript,
    timed,
    sentences,
    fullText:
      transcript.fullText ||
      sentences.map((s) => s.text).join(' ') ||
      '',
  };
}

function cmdScore(rest) {
  const opts = parseArgs(rest);
  const inPath = String(opts.in || '');
  if (!inPath) {
    console.error('缺少 --in <raw.json>');
    process.exit(1);
  }

  const raw = readJson(inPath);
  const top = parseInt(String(opts.top || '5'), 10);
  const minDuration = parseInt(String(opts['min-duration'] || '300'), 10);
  const maxDuration = parseInt(String(opts['max-duration'] || '1200'), 10);
  const slug = opts.topic ? topicSlug(String(opts.topic)) : '';

  const ranked = scoreVideos(raw, { top, minDuration, maxDuration });
  const outPath =
    String(opts.out || '') ||
    (slug ? rankedPath(slug) : join(hermesRoot, '探索', 'YouTube', 'ranked.json'));

  mkdirSync(outPath.replace(/[/\\][^/\\]+$/, ''), { recursive: true });
  const payload = {
    scoredAt: new Date().toISOString(),
    source: inPath,
    topic: raw.topic || opts.topic || '',
    slug,
    filters: { minDuration, maxDuration, top },
    videos: ranked,
  };
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(JSON.stringify({ ok: true, count: ranked.length, outPath }, null, 2));
}

function cmdExtract(rest) {
  const opts = parseArgs(rest);
  const lang = String(opts.lang || 'en,en-US');
  const mergeRaw = Boolean(opts['merge-raw']);

  /** @type {{ videoId: string, title?: string }[]} */
  let targets = [];
  /** @type {Record<string, unknown>[]} */
  let rankedVideos = [];

  if (opts['video-id']) {
    targets = [{ videoId: String(opts['video-id']) }];
  } else if (opts.from) {
    const ranked = readJson(String(opts.from));
    rankedVideos = Array.isArray(ranked.videos) ? ranked.videos : scoreVideos(ranked);
    targets = rankedVideos.map((v) => ({
      videoId: String(v.videoId),
      title: String(v.title || ''),
    }));
  } else {
    console.error('需要 --video-id 或 --from <ranked.json>');
    process.exit(1);
  }

  const transcripts = [];
  const results = [];

  for (const t of targets) {
    const enriched = runExtractPy(t.videoId, lang);
    transcripts.push(enriched);
    results.push({
      videoId: t.videoId,
      title: t.title,
      status: enriched.transcript_status,
      transcript: enriched,
    });
  }

  if (mergeRaw && rankedVideos.length) {
    const slug = topicSlug(String(opts.slug || opts.topic || rankedVideos[0]?.topic || 'untitled'));
    const topic = String(opts.topic || slug);
    const product = String(opts.product || topic);
    const map = new Map(transcripts.map((t) => [String(t.videoId), t]));
    const scriptsRaw = buildScriptsRaw(rankedVideos, map, { topic, product, slug });
    const out = writeScriptsRaw(slug, scriptsRaw);
    const okCount = scriptsRaw.filter((e) => e.ok).length;
    console.log(
      JSON.stringify(
        {
          ok: true,
          slug,
          scriptsRaw: out,
          transcriptCount: transcripts.length,
          okCount,
          results: results.map((r) => ({
            videoId: r.videoId,
            status: r.status,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (opts['video-id'] && results.length === 1) {
    console.log(JSON.stringify({ ok: true, transcript: results[0].transcript, results }, null, 2));
    return;
  }

  console.log(JSON.stringify({ ok: true, transcripts, results }, null, 2));
}

function cmdResearch(rest) {
  const opts = parseArgs(rest);
  const fromPath = String(opts.from || '');
  if (!fromPath) {
    console.error('缺少 --from <ranked.json>');
    process.exit(1);
  }

  const ranked = readJson(fromPath);
  const slug = topicSlug(String(opts.topic || ranked.slug || ranked.topic || 'untitled'));
  const topic = String(opts.topic || ranked.topic || slug);
  const product = String(opts.product || ranked.product || topic);

  cmdExtract([
    '--from',
    fromPath,
    '--lang',
    String(opts.lang || 'en,en-US'),
    '--merge-raw',
    '--slug',
    slug,
    '--topic',
    topic,
    '--product',
    product,
  ]);

  const scriptsRawFile = scriptsRawPath(slug);
  const htmlFile = reportHtmlPath(slug);
  buildReportFromScriptsRaw(scriptsRawFile, htmlFile, { topic, product, slug });
  const phrases = appendPhrasesFromScriptsRaw(readJson(scriptsRawFile), topic, product);

  console.log(
    JSON.stringify(
      {
        ok: true,
        reportHtml: htmlFile,
        scriptsRaw: scriptsRawFile,
        phrasesCsv: phrasesCsvPath(),
        phrasesAppended: phrases.appended,
      },
      null,
      2,
    ),
  );
}

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const handlers = {
  score: () => cmdScore(rest),
  extract: () => cmdExtract(rest),
  research: () => cmdResearch(rest),
};

const handler = handlers[command];
if (!handler) {
  console.error(`未知命令: ${command}\n`);
  console.log(USAGE);
  process.exit(1);
}

handler();
