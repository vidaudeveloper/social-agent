import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** skills/explore/youtube */
export const skillRoot = join(scriptsDir, '../..');

/** social-agent profile 仓库根 */
export const repoRoot = join(skillRoot, '../../..');

export const hermesRoot = resolve(repoRoot, process.env.HERMES_ROOT || 'content');

/** @deprecated v2 主产出在知识库；仅作内部中间态或 --fallback 调试 */
export const exploreYoutubeDir = join(hermesRoot, '探索', 'YouTube');

export const knowledgeYoutubeDir = join(hermesRoot, '知识库', 'youtube');

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
