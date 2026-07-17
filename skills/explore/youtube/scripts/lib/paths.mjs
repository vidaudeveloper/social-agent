import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** skills/explore/youtube */
export const skillRoot = join(scriptsDir, '../..');

/** social-agent profile 仓库根 */
export const repoRoot = join(skillRoot, '../../..');

export const contentRoot = resolve(repoRoot, process.env.CONTENT_ROOT || 'content');

/** @deprecated v2 主产出在知识库；仅作内部中间态或 --fallback 调试 */
export const exploreYoutubeDir = join(contentRoot, '探索', 'YouTube');

export const knowledgeYoutubeDir = join(contentRoot, '知识库', 'youtube');

/** yt-dlp 下载的本地 mp4（crv 输入） */
export function downloadsDir(videoId) {
  return join(knowledgeYoutubeDir, '_downloads', String(videoId || 'unknown'));
}

/**
 * 字幕/转写工作目录（官方字幕缓存、whisper 音频与 transcript.json）
 * 默认在知识库：知识库/youtube/_whisper/{videoId}
 * 可用 WHISPER_TMP 覆盖根目录（仍会按 videoId 分子目录）
 */
export function whisperDir(videoId) {
  const root = process.env.WHISPER_TMP || join(knowledgeYoutubeDir, '_whisper');
  return join(root, String(videoId || 'unknown'));
}

export const extractScriptPath = join(scriptsDir, '../extract_transcript.py');

/**
 * @param {string} slug
 * @returns {string}
 */
export function topicDir(slug) {
  return join(knowledgeYoutubeDir, slug);
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function reportHtmlPath(slug) {
  return join(topicDir(slug), `${slug}_爆款报告.html`);
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function scriptsRawPath(slug) {
  return join(topicDir(slug), 'scripts_raw.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function rankedPath(slug) {
  return join(topicDir(slug), 'ranked.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function rawPath(slug) {
  return join(topicDir(slug), 'raw.json');
}

/**
 * 运营种子（P0 免 API 发现入口）
 * @param {string} slug
 */
export function seedsPath(slug) {
  return join(topicDir(slug), 'seeds.json');
}

/**
 * 筛出的爆款候选（score 同步写出，与 ranked 同内容别名）
 * @param {string} slug
 */
export function viralCandidatesPath(slug) {
  return join(topicDir(slug), 'viral_candidates.json');
}

/** 全库金句表 */
export function phrasesCsvPath() {
  return join(knowledgeYoutubeDir, '金句库.csv');
}

/**
 * @param {string} topic
 * @returns {string}
 */
export function topicSlug(topic) {
  const s = String(topic || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'untitled';
}

/**
 * 北京时间格式化
 * @param {Date} [d]
 * @returns {string}
 */
export function formatBeijingTime(d = new Date()) {
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}
