import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** skills/analytics/youtube */
export const skillRoot = join(scriptsDir, '../..');

/** social-agent profile 仓库根 */
export const repoRoot = join(skillRoot, '../../..');

export const hermesRoot = resolve(repoRoot, process.env.HERMES_ROOT || 'content');

/** 发布后复盘根目录 */
export const analyticsYtDir = join(hermesRoot, '知识库', 'youtube', '发布复盘');

/**
 * @param {string} channelSlug
 */
export function channelDir(channelSlug) {
  return join(analyticsYtDir, channelSlug);
}

/**
 * @param {string} channelSlug
 * @param {string} dateKey YYYY-MM-DD
 */
export function reportHtmlPath(channelSlug, dateKey) {
  return join(channelDir(channelSlug), `${dateKey}_作品复盘.html`);
}

/**
 * @param {string} channelSlug
 * @param {string} dateKey
 */
export function reportJsonPath(channelSlug, dateKey) {
  return join(channelDir(channelSlug), `${dateKey}_作品复盘.json`);
}

/**
 * @param {string} channelSlug
 * @param {string} dateKey
 */
export function nextRefPath(channelSlug, dateKey) {
  return join(channelDir(channelSlug), `${dateKey}_下次创作参考.md`);
}

export function latestIndexPath() {
  return join(analyticsYtDir, 'LATEST.json');
}

/**
 * @param {string} name
 */
export function channelSlug(name) {
  const s = String(name || 'channel')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'channel';
}

/**
 * @param {Date} [d]
 */
export function formatBeijingTime(d = new Date()) {
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

/**
 * @param {Date} [d]
 */
export function formatBeijingDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * @param {number} daysInclusive
 * @param {Date} [end]
 */
export function defaultDateRange(daysInclusive = 30, end = new Date()) {
  const endKey = formatBeijingDate(end);
  const start = new Date(end.getTime() - (daysInclusive - 1) * 24 * 60 * 60 * 1000);
  return { startDate: formatBeijingDate(start), endDate: endKey };
}
