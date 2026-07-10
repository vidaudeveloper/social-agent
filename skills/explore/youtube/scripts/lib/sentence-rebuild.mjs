/**
 * Merge YouTube cue fragments into semantic sentences (aligned with workbuddy merge_sentences.py).
 */

/** @type {Set<string>} */
const STARTERS = new Set([
  'okay', 'so', 'but', 'and', 'then', 'now', "let's", 'let', 'first', 'second', 'third',
  'because', 'if', 'when', 'here', 'there', 'i', 'we', 'you', 'my', 'your', 'this', 'that',
  'it', 'for', 'to', 'why', 'how', 'what', 'who', 'well', 'actually', 'basically', 'also',
  'plus', 'um', 'uh', 'wait', 'see', 'look', 'guys', 'right', 'finally', 'next',
]);

const MAX_WORDS = 14;

/**
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimestamp(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/**
 * @param {{ text: string, start?: number }[]} segments
 * @returns {{ t: string, text: string }[]}
 */
export function segmentsToTimed(segments) {
  if (!Array.isArray(segments)) return [];
  return segments
    .map((seg) => ({
      t: formatTimestamp(seg.start ?? 0),
      text: String(seg.text || '').trim(),
    }))
    .filter((s) => s.text);
}

/**
 * @param {{ t: string, text: string }[]} timed
 * @returns {{ start: string, end: string, text: string }[]}
 */
export function mergeSentencesFromTimed(timed) {
  if (!timed?.length) return [];

  /** @type {{ start: string, end: string, text: string }[]} */
  const sentences = [];
  let curText = '';
  let curStart = timed[0].t;
  let curEnd = timed[0].t;

  const flush = () => {
    if (curText.trim()) {
      sentences.push({ start: curStart, end: curEnd, text: curText.trim() });
    }
    curText = '';
    curStart = '';
    curEnd = '';
  };

  for (const seg of timed) {
    if (!curStart) curStart = seg.t;
    curEnd = seg.t;
    const w = seg.text.trim();
    if (!w) continue;

    if (/[.!?]$/.test(w)) {
      curText = `${curText} ${w}`.trim();
      flush();
      continue;
    }

    const firstWord = w.toLowerCase().replace(/[^a-z']/g, '').split(' ')[0];
    if (STARTERS.has(firstWord) && curText.split(/\s+/).filter(Boolean).length >= 3) {
      flush();
      curStart = seg.t;
    }

    curText = `${curText} ${w}`.trim();
    if (curText.split(/\s+/).filter(Boolean).length >= MAX_WORDS) {
      flush();
    }
  }

  flush();
  return sentences;
}

/**
 * @param {{ text: string, start?: number }[]} segments
 * @returns {{ timed: { t: string, text: string }[], sentences: { start: string, end: string, text: string }[] }}
 */
export function rebuildFromSegments(segments) {
  const timed = segmentsToTimed(segments);
  const sentences = mergeSentencesFromTimed(timed);
  return { timed, sentences };
}

/**
 * Derive hook/body/cta from sentences (placeholder until Agent refines).
 * @param {{ start: string, end: string, text: string }[]} sentences
 * @returns {{ hook: string, body: string, cta: string }}
 */
export function deriveStructure(sentences) {
  if (!sentences.length) {
    return { hook: '', body: '', cta: '' };
  }
  const hook = sentences[0]?.text || '';
  const cta = sentences.length > 1 ? sentences[sentences.length - 1]?.text || '' : '';
  const body =
    sentences.length > 2
      ? sentences
          .slice(1, -1)
          .map((s) => s.text)
          .join(' ')
      : sentences[1]?.text || '';
  return { hook, body, cta };
}
