import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { rebuildFromSegments, deriveStructure } from './sentence-rebuild.mjs';
import { formatViews } from './score.mjs';
import { scriptsRawPath } from './paths.mjs';

/**
 * @param {unknown} n
 * @returns {string}
 */
function formatEr(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '0%';
  return `${(v * 100).toFixed(2)}%`;
}

/**
 * Pick short punchy phrases from sentences as golden phrase candidates.
 * @param {{ text: string }[]} sentences
 * @param {number} [max]
 * @returns {string[]}
 */
export function extractGoldenPhraseCandidates(sentences, max = 5) {
  if (!sentences?.length) return [];
  const candidates = [];
  for (const s of sentences) {
    const t = s.text.trim();
    const words = t.split(/\s+/).length;
    if (words >= 4 && words <= 18 && /[.!?]$/.test(t)) {
      candidates.push(t);
    }
  }
  if (candidates.length < max) {
    for (const s of sentences.slice(0, 3)) {
      if (s.text && !candidates.includes(s.text)) candidates.push(s.text);
    }
  }
  return candidates.slice(0, max);
}

/**
 * @param {Record<string, unknown>} video ranked video
 * @param {Record<string, unknown> | null} transcript
 * @param {{ topic: string, product: string }} ctx
 * @returns {Record<string, unknown>}
 */
export function buildScriptRawEntry(video, transcript, ctx) {
  const ok = transcript?.transcript_status === 'ok';
  const segments = ok ? transcript.segments : [];
  const { timed, sentences } = rebuildFromSegments(
    /** @type {{ text: string, start?: number }[]} */ (segments),
  );
  const structure = deriveStructure(sentences);
  const fullText = ok
    ? String(transcript.fullText || sentences.map((s) => s.text).join(' '))
    : '';

  return {
    id: String(video.videoId),
    title: String(video.title || ''),
    channel: String(video.channelTitle || ''),
    views: formatViews(video.viewCount),
    er: video.erFormatted || formatEr(video.er),
    grade: String(video.gradeLabel || video.grade || ''),
    dur: Math.round(Number(video.durationSec || 0)),
    topic: ctx.topic,
    product: ctx.product,
    ok,
    text: fullText,
    timed,
    sentences,
    structure,
    golden_phrases: extractGoldenPhraseCandidates(sentences),
    url: String(video.url || `https://www.youtube.com/watch?v=${video.videoId}`),
    err: ok ? undefined : String(transcript?.error || 'transcript unavailable'),
    deep_dive: video.deep_dive || null,
  };
}

/**
 * @param {Record<string, unknown>[]} videos
 * @param {Map<string, Record<string, unknown>>} transcriptMap
 * @param {{ topic: string, product: string, slug: string }} ctx
 * @returns {Record<string, unknown>[]}
 */
export function buildScriptsRaw(videos, transcriptMap, ctx) {
  return videos.map((v) =>
    buildScriptRawEntry(v, transcriptMap.get(String(v.videoId)) || null, ctx),
  );
}

/**
 * @param {string} slug
 * @param {Record<string, unknown>[]} entries
 */
export function writeScriptsRaw(slug, entries) {
  const path = scriptsRawPath(slug);
  mkdirSync(path.replace(/[/\\][^/\\]+$/, ''), { recursive: true });
  writeFileSync(path, JSON.stringify(entries, null, 2), 'utf8');
  return path;
}

/**
 * @param {string} slug
 * @returns {Record<string, unknown>[]}
 */
export function readScriptsRaw(slug) {
  const path = scriptsRawPath(slug);
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Merge Agent analysis fields into existing scripts_raw entries.
 * @param {string} slug
 * @param {Record<string, { structure?: object, golden_phrases?: string[], deep_dive?: object }>} updates keyed by video id
 */
export function mergeScriptAnalysis(slug, updates) {
  const entries = readScriptsRaw(slug);
  for (const entry of entries) {
    const u = updates[String(entry.id)];
    if (!u) continue;
    if (u.structure) entry.structure = { .../** @type {object} */ (entry.structure), ...u.structure };
    if (u.golden_phrases?.length) entry.golden_phrases = u.golden_phrases;
    if (u.deep_dive) entry.deep_dive = u.deep_dive;
  }
  writeScriptsRaw(slug, entries);
  return entries;
}
