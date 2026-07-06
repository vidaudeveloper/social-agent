const TEST_PATTERNS = [
  /integration\s+test/i,
  /please\s+ignore/i,
  /\bhermes\b/i,
  /pipeline\s+test/i,
  /\bsocial-agent\s+test\b/i,
];

/**
 * @param {string} text
 */
export function noTestMarkers(text) {
  const issues = [];
  for (const pattern of TEST_PATTERNS) {
    if (pattern.test(text)) {
      issues.push(`含测试文案（${pattern.source}）`);
    }
  }
  return issues;
}

/**
 * @param {string} content
 * @returns {{ title: string, body: string }}
 */
export function extractTitleAndBody(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  let bodyStart = 0;

  if (lines[0]?.startsWith('# ')) {
    title = lines[0].slice(2).trim();
    bodyStart = 1;
    while (bodyStart < lines.length && !lines[bodyStart].trim()) {
      bodyStart += 1;
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim();
  return { title, body };
}

/**
 * @param {string} pattern
 * @param {string} text
 * @param {string} label
 */
export function matchPattern(pattern, text, label) {
  try {
    const re = new RegExp(pattern, 'mu');
    if (re.test(text)) {
      return [`命中禁则: ${label}`];
    }
  } catch {
    return [`无效正则: ${pattern}`];
  }
  return [];
}
