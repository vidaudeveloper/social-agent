import { extractChecksForRow, buildRubricPrompt } from './extract-limits.mjs';

/** CSV 平台名 → rules 文件名（不含 .yaml） */
export const CSV_PLATFORM_IDS = {
  'TikTok（海外短视频）': 'tiktok',
  'YouTube（长视频）': 'youtube',
  'Instagram（IG）': 'instagram',
  'Facebook（FB）': 'facebook',
  'LinkedIn（领英 / B 端职场）': 'linkedin',
  '小红书（国内种草）': 'xiaohongshu',
  '知乎（国内知识问答）': 'zhihu',
};

/** 不由 CSV 覆盖的平台（手写维护） */
export const MANUAL_RULE_PLATFORMS = new Set(['reddit', 'wechat', 'douyin', 'x', '_common']);

/** 各平台固定 script 检查（CSV 同步后追加） */
export const STATIC_SCRIPT_CHECKS = {
  xiaohongshu: [
    {
      id: 'hashtags_last_line',
      severity: 'error',
      type: 'script',
      handler: 'xhs.hashtagsLastLine',
    },
    {
      id: 'forbidden_image_ext',
      severity: 'error',
      type: 'script',
      handler: 'xhs.forbiddenImageExt',
      params: { blocked: ['gif', 'bmp', 'svg', 'heic'] },
    },
  ],
  zhihu: [
    { id: 'no_markdown_headers', severity: 'error', type: 'script', handler: 'zhihu.noMarkdownHeaders' },
    { id: 'no_pipe_tables', severity: 'error', type: 'script', handler: 'zhihu.noPipeTables' },
    { id: 'no_blockquotes', severity: 'error', type: 'script', handler: 'zhihu.noBlockquotes' },
  ],
};

/**
 * @param {object} params
 */
function serializeParams(params) {
  if (!params || !Object.keys(params).length) return '';
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      parts.push(`${k}: [${v.join(', ')}]`);
    } else if (typeof v === 'string') {
      parts.push(`${k}: ${v}`);
    } else {
      parts.push(`${k}: ${v}`);
    }
  }
  return `    params: { ${parts.join(', ')} }`;
}

/**
 * @param {object} check
 */
function serializeCheck(check, indent = '  ') {
  const lines = [`${indent}- id: ${check.id}`];
  if (check.carrier) {
    lines.push(`${indent}  carrier: ${check.carrier}`);
  }
  if (check.primary) {
    lines.push(`${indent}  primary: true`);
  }
  lines.push(`${indent}  severity: ${check.severity}`);
  lines.push(`${indent}  type: ${check.type}`);
  if (check.handler) {
    lines.push(`${indent}  handler: ${check.handler}`);
  }
  if (check.params) {
    lines.push(serializeParams(check.params).replace(/^    /, `${indent}  `));
  }
  if (check.source_text) {
    lines.push(`${indent}  source_text: "${check.source_text.replace(/"/g, '\\"')}"`);
  }
  if (check.prompt) {
    lines.push(`${indent}  prompt: ${check.prompt}`);
  }
  return lines.join('\n');
}

/**
 * @param {string} platformName
 * @param {object[]} platformRows
 */
export function buildPlatformYaml(platformName, platformRows) {
  const platformId = CSV_PLATFORM_IDS[platformName];
  if (!platformId) {
    throw new Error(`未映射的平台: ${platformName}`);
  }

  const checks = [];
  let prevRow = null;
  const hasPrimary = platformRows.some((r) => r.carrier.includes('主推'));

  for (let i = 0; i < platformRows.length; i += 1) {
    const row = platformRows[i];
    const isPrimary = row.carrier.includes('主推') || (!hasPrimary && i === 0);
    const extracted = extractChecksForRow(row, prevRow, platformId, isPrimary).map((c) => ({
      ...c,
      type: 'script',
    }));

    for (const c of extracted) {
      checks.push(c);
    }

    checks.push({
      id: `standard_ref_${slugCarrier(row.carrier)}`,
      carrier: row.carrier,
      primary: isPrimary,
      severity: 'info',
      type: 'rubric',
      prompt: buildRubricPrompt(row),
    });

    prevRow = row;
  }

  const staticChecks = STATIC_SCRIPT_CHECKS[platformId] ?? [];
  for (const sc of staticChecks) {
    if (!checks.some((c) => c.id === sc.id && !c.carrier)) {
      checks.push({ ...sc, primary: true });
    }
  }

  const lines = [
    '# AUTO-GENERATED from specs/platform-publish-standards.csv',
    '# 勿手改 — 编辑 CSV 后执行 npm run review:sync-specs',
    `platform: ${platformId}`,
    `display_name: ${platformName}`,
    'version: 1',
    'source: platform-publish-standards.csv',
    '',
    'checks:',
  ];

  for (const check of checks) {
    lines.push(serializeCheck(check));
  }

  lines.push('', 'forbidden: {}', '');
  return lines.join('\n');
}

/**
 * @param {string} carrier
 */
function slugCarrier(carrier) {
  return carrier
    .replace(/[（(].*?[）)]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w\u4e00-\u9fff_-]/g, '')
    .slice(0, 24) || 'default';
}

/**
 * @param {object[]} rows
 * @returns {Map<string, string>}
 */
export function buildAllPlatformYamls(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.platform)) {
      groups.set(row.platform, []);
    }
    groups.get(row.platform).push(row);
  }

  const out = new Map();
  for (const [platformName, platformRows] of groups) {
    const id = CSV_PLATFORM_IDS[platformName];
    if (!id) continue;
    out.set(id, buildPlatformYaml(platformName, platformRows));
  }
  return out;
}
