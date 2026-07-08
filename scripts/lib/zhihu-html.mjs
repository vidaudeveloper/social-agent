#!/usr/bin/env node
/**
 * Markdown / 纯文本 → 知乎多段落 HTML（**加粗** → strong，段间空行 → 多个 <p>）
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineFormat(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function markdownToZhihuHtml(raw) {
  let body = raw.replace(/\r\n/g, '\n');

  const fm = body.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
  if (fm) body = fm[1];

  const lines = body.split('\n');
  const paragraphs = [];
  let buffer = [];

  function flush() {
    const text = buffer.join('\n').trim();
    if (text) paragraphs.push(text);
    buffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flush();
      continue;
    }
    buffer.push(trimmed);
  }
  flush();

  if (paragraphs.length === 0) {
    return '<p></p>';
  }

  return paragraphs.map((p) => `<p>${inlineFormat(p)}</p>`).join('\n');
}
