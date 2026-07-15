import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** skills/explore/xiaohongshu */
export const skillRoot = join(scriptsDir, '../..');

/** social-agent profile 仓库根 */
export const repoRoot = join(skillRoot, '../../..');

export const hermesRoot = resolve(repoRoot, process.env.HERMES_ROOT || 'content');

export const knowledgeXhsDir = join(hermesRoot, '知识库', 'xiaohongshu');

/**
 * @param {string} slug
 * @returns {string}
 */
export function topicDir(slug) {
  return join(knowledgeXhsDir, slug);
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function metaPath(slug) {
  return join(topicDir(slug), 'meta.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function rawPath(slug) {
  return join(topicDir(slug), 'raw.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function detailsPath(slug) {
  return join(topicDir(slug), 'details.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function insightsPath(slug) {
  return join(topicDir(slug), 'insights.json');
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function reportHtmlPath(slug) {
  return join(topicDir(slug), `${slug}_竞品报告.html`);
}

/**
 * @param {string} slug
 * @returns {string}
 */
export function creativeRefPath(slug) {
  return join(topicDir(slug), `${slug}_创作参考.md`);
}

/** 全库索引：最近一次报告，供编排器快速定位 */
export function latestIndexPath() {
  return join(knowledgeXhsDir, 'LATEST.json');
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

/**
 * 北京时间日期 YYYY-MM-DD
 * @param {Date} [d]
 * @returns {string}
 */
export function formatBeijingDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
