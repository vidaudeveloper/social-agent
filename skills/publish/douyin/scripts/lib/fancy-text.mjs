const KEYWORD_RE =
  /(\d+(?:\.\d+)?%?|\$[\d.]+|[A-Za-z][A-Za-z0-9]*(?:\s?[A-Za-z][A-Za-z0-9]*)*)/g;

const HIGHLIGHT_COLORS = ['&H00FFFF&', '&H00E5FF&', '&H66FF00&', '&H00A5FF&'];

/**
 * ASS 内联颜色 + 加粗高亮关键词（花字）
 * @param {string} text
 * @param {number} [baseFs=84]
 */
export function toFancyAssText(text, baseFs = 84) {
  const kwFs = baseFs + 14;
  let colorIdx = 0;
  let out = '';
  let last = 0;
  let m;

  KEYWORD_RE.lastIndex = 0;
  while ((m = KEYWORD_RE.exec(text)) !== null) {
    const word = m[0];
    if (m.index > 0 && text[m.index - 1] === '\\') continue;
    if (word.length < 2 && !/\d/.test(word)) continue;
    if (/^(的|了|是|在|和|与|或|就|也|都|而|但)$/u.test(word)) continue;

    out += escapeAss(text.slice(last, m.index));
    const color = HIGHLIGHT_COLORS[colorIdx % HIGHLIGHT_COLORS.length];
    colorIdx += 1;
    out += `{\\b1\\c${color}\\fs${kwFs}}${escapeAss(word)}{\\b0\\c&HFFFFFF&\\fs${baseFs}}`;
    last = m.index + word.length;
  }
  out += escapeAss(text.slice(last));
  return out;
}

/**
 * @param {string} s
 */
function escapeAss(s) {
  return s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\n/g, '\\N');
}
