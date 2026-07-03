const SCENE_RE = /\[画面[:：][^\]]*\]|\[Scene[:：][^\]]*\]/gi;
const SECTION_HEADER_RE = /^\*\*\([^)]+\)\*\*\s*$/;
const META_LINE_RE = /^\*\*(时长|字数|适用|Duration|Words|Scene)[^*]*\*\*\s*[:：]?/i;

/**
 * @param {string} raw
 */
export function parseTiktokScript(raw) {
  let title = 'TikTok Video';
  let body = raw;

  const fm = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (fm) {
    const yaml = fm[1];
    const titleMatch = yaml.match(/^title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();
    body = fm[2];
  } else {
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1) {
      title = h1[1].replace(/\s*\|.*$/, '').trim();
    }
  }

  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (l.startsWith('#')) return false;
      if (l === '---') return false;
      if (SECTION_HEADER_RE.test(l)) return false;
      if (META_LINE_RE.test(l)) return false;
      if (/^(\*\*)?(标注|Notes|Note)[:：]/i.test(l)) return false;
      return true;
    })
    .map((l) =>
      l
        .replace(SCENE_RE, '')
        .replace(/\*\*/g, '')
        .replace(/^[-*]\s+/, '')
        .trim()
    )
    .filter(Boolean);

  const sentences = [];
  for (const line of lines) {
    const parts = line
      .split(/(?<=[.!?])\s+/u)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (countWords(part) <= 22) {
        sentences.push(part);
      } else {
        sentences.push(...chunkByWords(part, 18));
      }
    }
  }

  const plainText = sentences.join(' ');
  return { title, sentences, plainText };
}

/**
 * @param {string} text
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {string} text
 * @param {number} maxWords
 */
function chunkByWords(text, maxWords) {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}
