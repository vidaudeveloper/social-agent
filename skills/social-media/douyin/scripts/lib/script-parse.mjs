const SCENE_RE = /\[画面[:：][^\]]*\]/g;
const SECTION_HEADER_RE = /^\*\*（[^）]+）\*\*\s*$/;
const META_LINE_RE = /^\*\*(时长|字数|适用)[^*]*\*\*\s*[:：]?/;

/**
 * @param {string} raw
 */
export function parseDouyinScript(raw) {
  let title = '抖音口播视频';
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
      if (l.startsWith('**标注')) return false;
      if (l.startsWith('标注说明')) return false;
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
      .split(/(?<=[。！？!?；;])/u)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (part.length <= 28) {
        sentences.push(part);
      } else {
        sentences.push(...chunkText(part, 22));
      }
    }
  }

  const plainText = sentences.join('');
  return { title, sentences, plainText };
}

/**
 * @param {string} text
 * @param {number} maxLen
 */
function chunkText(text, maxLen) {
  const chunks = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = maxLen;
    const slice = rest.slice(0, maxLen);
    const comma = Math.max(
      slice.lastIndexOf('，'),
      slice.lastIndexOf(','),
      slice.lastIndexOf('、')
    );
    if (comma > 8) cut = comma + 1;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
