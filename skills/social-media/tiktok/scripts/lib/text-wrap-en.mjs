/** English on-screen captions: wider lines, word-aware wrap */
const MAX_CHARS_PER_LINE = 18;
const MAX_LINES = 2;
const MAX_CHARS_PER_CUE = MAX_CHARS_PER_LINE * MAX_LINES;

/**
 * @param {string} text
 * @param {number} maxPerLine
 */
export function wrapPlainLines(text, maxPerLine = MAX_CHARS_PER_LINE) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxPerLine) {
      current = next;
      continue;
    }
    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxPerLine));
      current = word.slice(maxPerLine);
    }
    if (lines.length >= MAX_LINES) break;
  }

  if (lines.length < MAX_LINES && current) {
    lines.push(current);
  }

  if (lines.length === MAX_LINES && words.length > 0) {
    const used = lines.join(' ').split(/\s+/).length;
    const rest = words.slice(used).join(' ');
    if (rest) {
      const last = lines[MAX_LINES - 1];
      lines[MAX_LINES - 1] =
        last.length + rest.length + 1 > maxPerLine
          ? `${last.slice(0, maxPerLine - 1)}…`
          : `${last} ${rest}`;
    }
  }

  return lines.slice(0, MAX_LINES);
}

/**
 * @param {string} text
 */
export function fontSizeForText(text) {
  const lines = text.includes('\\N') ? text.split('\\N') : wrapPlainLines(text);
  const maxLen = Math.max(...lines.map((l) => l.length), 1);
  if (maxLen <= 12) return 88;
  if (maxLen <= 16) return 76;
  if (maxLen <= 20) return 68;
  return 60;
}

/**
 * @param {{ start: number, end: number, text: string }[]} cues
 * @param {(line: string, baseFs: number) => string} fancyFn
 */
export function splitAndWrapCues(cues, fancyFn) {
  const out = [];
  for (const cue of cues) {
    const text = cue.text.trim();
    if (text.length <= MAX_CHARS_PER_CUE) {
      const lines = wrapPlainLines(text);
      const fs = fontSizeForText(lines.join(' '));
      out.push({
        ...cue,
        text: lines.join('\n'),
        fancyText: lines.map((l) => fancyFn(l, fontSizeForText(l))).join('\\N'),
      });
      continue;
    }

    const words = text.split(/\s+/);
    let chunk = [];
    let chunkLen = 0;
    const parts = [];

    for (const w of words) {
      const add = chunkLen ? w.length + 1 : w.length;
      if (chunkLen + add > MAX_CHARS_PER_CUE && chunk.length) {
        parts.push(chunk.join(' '));
        chunk = [w];
        chunkLen = w.length;
      } else {
        chunk.push(w);
        chunkLen += add;
      }
    }
    if (chunk.length) parts.push(chunk.join(' '));

    const total = parts.length;
    const span = (cue.end - cue.start) / total;
    parts.forEach((part, i) => {
      const lines = wrapPlainLines(part);
      out.push({
        start: cue.start + i * span,
        end: cue.start + (i + 1) * span,
        text: lines.join('\n'),
        fancyText: lines.map((l) => fancyFn(l, fontSizeForText(l))).join('\\N'),
      });
    });
  }
  return out;
}
