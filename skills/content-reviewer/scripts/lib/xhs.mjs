/**
 * 小红书标题 UTF-16 长度计算，对齐 title_utils.py / Go CalcTitleLength。
 * @param {string} s
 */
export function calcTitleLength(s) {
  let byteLen = 0;
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      byteLen += 2;
      i += 1;
    } else if (code > 127) {
      byteLen += 2;
    } else {
      byteLen += 1;
    }
  }
  return Math.floor((byteLen + 1) / 2);
}

/**
 * @param {string} title
 * @param {number} max
 */
export function titleLength(title, max = 20) {
  const len = calcTitleLength(title || '');
  if (len > max) {
    return [`标题过长（${len} 单位，上限 ${max}）`];
  }
  if (!title?.trim()) {
    return ['标题为空'];
  }
  return [];
}

/**
 * @param {string} body
 */
export function hashtagsLastLine(body) {
  const lines = body.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
  if (!lines.length) return [];

  const hashtagLines = lines.filter((l) => /#\S+/.test(l));
  if (!hashtagLines.length) return [];

  const lastLine = lines[lines.length - 1];
  if (!/^#[\w\u4e00-\u9fff]+(?:\s+#[\w\u4e00-\u9fff]+)*\s*$/u.test(lastLine.trim())) {
    return ['话题标签应放在正文最后一行，格式：#标签1 #标签2'];
  }
  return [];
}

/**
 * @param {string[]} imagePaths
 * @param {string[]} blocked
 */
export function forbiddenImageExt(imagePaths, blocked = ['gif', 'bmp', 'svg', 'heic']) {
  const issues = [];
  const blockedSet = new Set(blocked.map((e) => e.toLowerCase().replace(/^\./, '')));

  for (const p of imagePaths) {
    const ext = p.split('.').pop()?.toLowerCase() ?? '';
    if (blockedSet.has(ext)) {
      issues.push(`图片格式不允许: ${p} (.${ext})`);
    }
  }
  return issues;
}
