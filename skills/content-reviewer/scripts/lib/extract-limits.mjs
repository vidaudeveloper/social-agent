/**
 * 从 CSV 文案列提取可机器校验的数值上限/下限。
 */

const SAME_AS_ABOVE = /^同上$/;

/**
 * @param {string} value
 * @param {string} fallback
 */
export function resolveField(value, fallback) {
  const v = (value || '').trim();
  if (!v || SAME_AS_ABOVE.test(v)) {
    return (fallback || '').trim();
  }
  return v;
}

/**
 * @param {string} text
 * @returns {{ id: string, handler: string, params: object, source_text: string, severity: string }[]}
 */
export function extractNumericChecks(text, { platformId, carrier }) {
  const checks = [];
  const t = text || '';

  const titleChar = t.match(/标题(?:精炼)?[≤<=]\s*(\d+)\s*字符/);
  if (titleChar) {
    checks.push({
      id: 'title_max_chars',
      handler: 'limits.titleMaxLength',
      params: { max: Number(titleChar[1]), unit: 'char' },
      source_text: titleChar[0],
      severity: 'error',
    });
  }

  const titleZi = t.match(/标题[≤<=]\s*(\d+)\s*字(?!符)/);
  if (titleZi) {
    const isXhs = platformId === 'xiaohongshu';
    checks.push({
      id: 'title_max_length',
      handler: isXhs ? 'xhs.titleLength' : 'limits.titleMaxLength',
      params: { max: Number(titleZi[1]), unit: isXhs ? 'utf16_xhs' : 'char' },
      source_text: titleZi[0],
      severity: 'error',
    });
  }

  const columnTitle = t.match(/专栏标题[≤<=]\s*(\d+)\s*字(?!符)/);
  if (columnTitle) {
    checks.push({
      id: 'column_title_max',
      handler: 'limits.titleMaxLength',
      params: { max: Number(columnTitle[1]), unit: 'char' },
      source_text: columnTitle[0],
      severity: 'error',
    });
  }

  const bodyZi = t.match(/正文上限\s*(\d+)\s*字(?!符)/);
  if (bodyZi) {
    checks.push({
      id: 'body_max_chars',
      handler: 'limits.bodyMaxLength',
      params: { max: Number(bodyZi[1]), unit: 'char' },
      source_text: bodyZi[0],
      severity: 'error',
    });
  }

  const bodyChar = t.match(/正文上限\s*(\d+)\s*字符/);
  if (bodyChar) {
    checks.push({
      id: 'body_max_chars',
      handler: 'limits.bodyMaxLength',
      params: { max: Number(bodyChar[1]), unit: 'char' },
      source_text: bodyChar[0],
      severity: 'error',
    });
  }

  const introChar = t.match(/简介\s*(\d+)\s*字符/);
  if (introChar && !bodyChar) {
    checks.push({
      id: 'description_max_chars',
      handler: 'limits.bodyMaxLength',
      params: { max: Number(introChar[1]), unit: 'char' },
      source_text: introChar[0],
      severity: 'error',
    });
  }

  const videoIntro = t.match(/视频简介[≤<=]\s*(\d+)\s*字(?!符)/);
  if (videoIntro) {
    checks.push({
      id: 'video_intro_max',
      handler: 'limits.bodyMaxLength',
      params: { max: Number(videoIntro[1]), unit: 'char' },
      source_text: videoIntro[0],
      severity: 'error',
    });
  }

  const segmentChar = t.match(/单段文字[≤<=]\s*(\d+)\s*字符/);
  if (segmentChar) {
    checks.push({
      id: 'segment_text_max',
      handler: 'limits.bodyMaxLength',
      params: { max: Number(segmentChar[1]), unit: 'char' },
      source_text: segmentChar[0],
      severity: 'error',
    });
  }

  return dedupeChecks(checks);
}

/**
 * @param {string} text
 */
export function extractHashtagChecks(text) {
  const checks = [];
  const t = text || '';

  const range = t.match(/(\d+)\s*[–-]\s*(\d+)\s*个/);
  const totalMax = t.match(/总数[≤<=]\s*(\d+)/);
  const tagMax = t.match(/最多\s*(\d+)\s*个(?:精准)?标签/);

  const params = {};
  if (range) {
    params.min = Number(range[1]);
    params.max = Number(range[2]);
  }
  if (totalMax) {
    params.max = Number(totalMax[1]);
  }
  if (tagMax && !params.max) {
    params.max = Number(tagMax[1]);
  }

  if (params.min !== undefined || params.max !== undefined) {
    checks.push({
      id: 'hashtag_count',
      handler: 'limits.hashtagCount',
      params,
      source_text: t.slice(0, 80),
      severity: 'warn',
    });
  }

  return checks;
}

/**
 * @param {string} text
 */
export function extractImageChecks(text) {
  const checks = [];
  const m = (text || '').match(/单(?:篇|帖)最多\s*(\d+)\s*张/);
  if (m) {
    checks.push({
      id: 'image_count_max',
      handler: 'limits.imageCountMax',
      params: { max: Number(m[1]) },
      source_text: m[0],
      severity: 'warn',
    });
  }
  return checks;
}

/**
 * @param {{ id: string }[]} checks
 */
function dedupeChecks(checks) {
  const seen = new Set();
  return checks.filter((c) => {
    const key = `${c.id}:${JSON.stringify(c.params)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @param {object} row
 * @param {object} prevRow - same platform previous row for 同上
 * @param {string} platformId
 */
export function extractChecksForRow(row, prevRow, platformId, isPrimary = false) {
  const copy = resolveField(row.copy, prevRow?.copy);
  const hashtag = resolveField(row.hashtag, prevRow?.hashtag);
  const duration = row.duration || '';

  const numeric = [
    ...extractNumericChecks(copy, { platformId, carrier: row.carrier }),
    ...extractHashtagChecks(hashtag),
    ...extractImageChecks(duration),
  ];

  return numeric.map((c) => ({
    ...c,
    carrier: row.carrier,
    primary: isPrimary,
  }));
}

/**
 * @param {object} row
 */
export function buildRubricPrompt(row) {
  const parts = [
    `【${row.carrier}】对照发布标准：`,
    row.aspect && `画面：${row.aspect}`,
    row.duration && `时长/数量：${row.duration}`,
    row.size && `大小：${row.size}`,
    row.cover && `封面：${row.cover}`,
    row.subtitle && `字幕：${row.subtitle}`,
    row.compliance && `合规：${row.compliance}`,
  ].filter(Boolean);
  return parts.join('；');
}
