/**
 * English voiceover sentence splitting for YouTube transcripts.
 * @param {string} text
 * @param {{ maxWords?: number }} [opts]
 * @returns {string[]}
 */
export function splitEnglishSentences(text, opts = {}) {
  const maxWords = opts.maxWords ?? 22;
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const parts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sentences = [];
  for (const part of parts) {
    const words = part.split(/\s+/);
    if (words.length <= maxWords) {
      sentences.push(part);
      continue;
    }
    sentences.push(...chunkByWords(part, maxWords));
  }
  return sentences;
}

/**
 * @param {string} text
 * @param {number} maxWords
 * @returns {string[]}
 */
function chunkByWords(text, maxWords) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}
