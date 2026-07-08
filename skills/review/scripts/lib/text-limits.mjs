import { calcTitleLength } from './xhs.mjs';

/**
 * @param {string} text
 * @param {number} max
 * @param {{ unit?: string }} params
 */
export function titleMaxLength(text, max, params = {}) {
  const title = text || '';
  if (!title.trim()) {
    return ['标题为空'];
  }

  let len;
  if (params.unit === 'utf16_xhs') {
    len = calcTitleLength(title);
  } else {
    len = [...title].length;
  }

  if (len > max) {
    const unitLabel = params.unit === 'utf16_xhs' ? '单位（小红书 UTF-16）' : '字符';
    return [`标题过长（${len} ${unitLabel}，上限 ${max}）`];
  }
  return [];
}

/**
 * @param {string} text
 * @param {number} max
 */
export function bodyMaxLength(text, max) {
  const body = text || '';
  const len = [...body].length;
  if (len > max) {
    return [`正文过长（${len} 字符，上限 ${max}）`];
  }
  return [];
}

/**
 * @param {string} text
 * @param {{ min?: number, max?: number }} params
 */
export function hashtagCount(text, params = {}) {
  const tags = (text || '').match(/#[\w\u4e00-\u9fff]+/gu) ?? [];
  const issues = [];
  if (params.min !== undefined && tags.length < params.min) {
    issues.push(`标签过少（${tags.length} 个，建议 ≥${params.min}）`);
  }
  if (params.max !== undefined && tags.length > params.max) {
    issues.push(`标签过多（${tags.length} 个，上限 ${params.max}）`);
  }
  return issues;
}

/**
 * @param {string[]} images
 * @param {number} max
 */
export function imageCountMax(images, max) {
  const count = images?.length ?? 0;
  if (count > max) {
    return [`图片数量过多（${count} 张，上限 ${max}）`];
  }
  return [];
}
