export const DEFAULT_MAX_DURATION_SEC = 90;
export const DEFAULT_MIN_DURATION_SEC = 60;

/**
 * @param {string} rate e.g. +50%
 */
export function parseTtsRateMultiplier(rate) {
  const m = String(rate || '+0%').match(/([+-]?\d+)%/);
  if (!m) return 1;
  return 1 + Number(m[1]) / 100;
}

/**
 * @param {string} rate
 * @returns {string | null} slower rate, or null if at floor
 * @deprecated TikTok 不使用放慢语速凑时长，保留仅供其它场景参考
 */
export function slowerTtsRate(rate) {
  void rate;
  return null;
}

/**
 * 口播过短时扩展文字（复述 + 过渡句），不改变 TTS 语速。
 * @param {string[]} sentences
 * @param {number} minSec
 * @param {number} maxSec
 * @param {string} ttsRate
 */
export function expandSentencesToMinDuration(sentences, minSec, maxSec, ttsRate = '+50%') {
  const base = sentences.filter(Boolean);
  if (!base.length) {
    throw new Error('[tiktok] Empty script cannot expand to min duration');
  }

  if (estimateDurationSec(base, ttsRate) >= minSec) {
    return { sentences: base, expanded: false, addedSentences: 0 };
  }

  const bridges = [
    'Quick recap.',
    'Here is the key point again.',
    'Listen closely.',
    'One more time.',
    'Let me say it again.',
    'This is important.',
  ];

  let expanded = [...base];
  const cap = maxSec * 0.94;

  for (let round = 0; round < 12; round += 1) {
    if (estimateDurationSec(expanded, ttsRate) >= minSec) {
      break;
    }

    const bridge = bridges[round % bridges.length];
    if (estimateDurationSec([...expanded, bridge], ttsRate) <= cap) {
      expanded.push(bridge);
    }

    for (const s of base) {
      if (estimateDurationSec(expanded, ttsRate) >= minSec) break;
      const next = [...expanded, s];
      if (estimateDurationSec(next, ttsRate) > cap) break;
      expanded.push(s);
    }
  }

  if (estimateDurationSec(expanded, ttsRate) < minSec) {
    const need = minWordsForDuration(minSec, ttsRate) - countWords(expanded.join(' '));
    throw new Error(
      `[tiktok] Script too short for min ${minSec}s at ${ttsRate}. Add about ${Math.max(need, 1)} more English words (no slowdown).`
    );
  }

  return {
    sentences: expanded,
    expanded: expanded.length > base.length,
    addedSentences: expanded.length - base.length,
  };
}

/**
 * Rough word count to reach target seconds at given rate.
 * @param {number} sec
 * @param {string} ttsRate
 */
export function minWordsForDuration(sec, ttsRate = '+50%') {
  const wpm = 150;
  const mult = parseTtsRateMultiplier(ttsRate);
  return Math.ceil((sec * wpm * mult) / 60);
}

/**
 * @param {string} text
 */
export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {string[]} sentences
 * @param {string} ttsRate
 */
export function estimateDurationSec(sentences, ttsRate = '+50%') {
  const words = countWords(sentences.join(' '));
  if (!words) return 0;
  const wpm = 150;
  const mult = parseTtsRateMultiplier(ttsRate);
  return (words / (wpm * mult)) * 60;
}

/**
 * @param {string[]} sentences
 * @param {number} maxSec
 * @param {string} ttsRate
 */
export function trimSentencesToDuration(sentences, maxSec, ttsRate = '+50%') {
  const selected = [];
  for (const s of sentences) {
    const trial = [...selected, s];
    const est = estimateDurationSec(trial, ttsRate);
    if (est > maxSec && selected.length > 0) {
      break;
    }
    selected.push(s);
  }

  return {
    sentences: selected.length ? selected : sentences.slice(0, 1),
    estimatedDuration: estimateDurationSec(selected, ttsRate),
    truncated: selected.length < sentences.length,
    removedCount: sentences.length - selected.length,
  };
}
