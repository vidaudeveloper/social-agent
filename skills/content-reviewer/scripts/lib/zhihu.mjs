/**
 * @param {string} content
 */
export function noMarkdownHeaders(content) {
  const issues = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+\S/.test(trimmed)) {
      issues.push(`禁止使用 Markdown 标题行: ${trimmed.slice(0, 40)}`);
      break;
    }
  }
  return issues;
}

/**
 * @param {string} content
 */
export function noPipeTables(content) {
  const issues = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    if (line.includes('|') && /^\s*\|?.+\|.+\|?\s*$/.test(line)) {
      issues.push('禁止使用 Markdown 表格（含 | 的行）');
      break;
    }
  }
  return issues;
}

/**
 * @param {string} content
 */
export function noBlockquotes(content) {
  const issues = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    if (/^>\s*\S/.test(line.trim())) {
      issues.push('禁止使用 > 引用块');
      break;
    }
  }
  return issues;
}
