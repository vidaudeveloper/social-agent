/**
 * 花字/on-screen 字幕：去掉标点（口播 TTS 仍保留原文标点）
 * @param {string} text
 */
export function stripDisplayPunctuation(text) {
  return text
    .replace(
      /[，。！？；：、,.!?;:'"''""\-—…（）【】《》「」『』\[\](){}]/gu,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {{ start: number, end: number, text: string }[]} cues
 */
export function cuesForDisplay(cues) {
  return cues
    .map((c) => ({
      ...c,
      text: stripDisplayPunctuation(c.text),
    }))
    .filter((c) => c.text.length > 0);
}
