import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** skills/analytics/xiaohongshu */
export const skillRoot = join(scriptsDir, '../..');

/** social-agent profile 仓库根 */
export const repoRoot = join(skillRoot, '../../..');

export const hermesRoot = resolve(repoRoot, process.env.HERMES_ROOT || 'content');

/** 发布后复盘根目录 */
export const analyticsXhsDir = join(hermesRoot, '知识库', 'xiaohongshu', '发布复盘');

/**
 * @param {string} accountSlug
 * @returns {string}
 */
export function accountDir(accountSlug) {
  return join(analyticsXhsDir, accountSlug);
}

/**
 * @param {string} accountSlug
 * @param {string} dateKey YYYY-MM-DD
 */
export function reportHtmlPath(accountSlug, dateKey) {
  return join(accountDir(accountSlug), `${dateKey}_作品复盘.html`);
}

/**
 * @param {string} accountSlug
 * @param {string} dateKey
 */
export function reportJsonPath(accountSlug, dateKey) {
  return join(accountDir(accountSlug), `${dateKey}_作品复盘.json`);
}

/**
 * @param {string} accountSlug
 * @param {string} dateKey
 */
export function nextRefPath(accountSlug, dateKey) {
  return join(accountDir(accountSlug), `${dateKey}_下次创作参考.md`);
}

export function latestIndexPath() {
  return join(analyticsXhsDir, 'LATEST.json');
}

/**
 * @param {string} name
 * @returns {string}
 */
export function accountSlug(name) {
  const s = String(name || 'account')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'account';
}

/**
 * 北京时间
 * @param {Date} [d]
 */
export function formatBeijingTime(d = new Date()) {
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

/**
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
