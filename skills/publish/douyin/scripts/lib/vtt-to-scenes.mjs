import { readFileSync } from 'fs';
import { toFancyAssText } from './fancy-text.mjs';
import { splitAndWrapCues, fontSizeForText } from './text-wrap.mjs';
import { cuesForDisplay } from './display-text.mjs';

/**
 * @param {string} vttPath
 * @returns {{ start: number, end: number, text: string, fancyText: string }[]}
 */
export function parseVtt(vttPath) {
  const raw = readFileSync(vttPath, 'utf8');
  const cues = [];
  const blocks = raw.split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    if (!lines.length) continue;

    let timeLineIdx = 0;
    if (!lines[0].includes('-->')) timeLineIdx = 1;
    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startRaw, endRaw] = timeLine.split('-->').map((s) => s.trim());
    const start = parseVttTime(startRaw);
    const end = parseVttTime(endRaw);
    const text = lines
      .slice(timeLineIdx + 1)
      .join('')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (!text) continue;
    cues.push({ start, end, text, fancyText: toFancyAssText(text) });
  }

  return mergeShortCues(cues);
}

/**
 * @param {{ start: number, end: number, text: string }[]} cues
 */
export function prepareDisplayCues(cues) {
  return splitAndWrapCues(cuesForDisplay(cues), (line, baseFs) =>
    toFancyAssText(line, baseFs)
  );
}

/**
 * @param {string} t
 */
function parseVttTime(t) {
  const m = t.match(/(?:(\d+):)?(\d+):(\d+)[.,](\d+)/);
  if (!m) return 0;
  const h = Number(m[1] || 0);
  const min = Number(m[2]);
  const sec = Number(m[3]);
  const ms = Number(m[4].padEnd(3, '0').slice(0, 3));
  return h * 3600 + min * 60 + sec + ms / 1000;
}

/**
 * @param {{ start: number, end: number, text: string, fancyText: string }[]} cues
 */
function mergeShortCues(cues) {
  if (cues.length <= 1) return cues;
  const merged = [cues[0]];
  for (let i = 1; i < cues.length; i += 1) {
    const prev = merged[merged.length - 1];
    const cur = cues[i];
    if (cur.text.length < 8 && cur.end - cur.start < 1.5) {
      const combinedText = prev.text + cur.text;
      if (combinedText.length <= 24) {
        prev.text = combinedText;
        prev.fancyText = toFancyAssText(prev.text);
        prev.end = cur.end;
      } else {
        merged.push(cur);
      }
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

/**
 * @param {number} sec
 */
export function formatAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/**
 * @param {{ start: number, end: number, fancyText: string }[]} cues
 * @param {string} fontName
 */
export function buildAss(cues, fontName = 'Microsoft YaHei') {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},84,&H00FFFFFF,&H000000FF,&H00000000,&HC0000000,-1,0,0,0,100,100,0,0,1,6,4,5,72,72,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const animations = [
    '{\\fad(120,80)\\t(0,220,\\fscx118\\fscy118)}',
    '{\\fad(100,70)\\move(540,1080,540,900,0,220)}',
    '{\\fad(120,80)\\t(0,180,\\fscx112\\fscy112)}',
  ];

  const events = cues
    .map((cue, i) => {
      const anim = animations[i % animations.length];
      const start = formatAssTime(cue.start);
      const end = formatAssTime(Math.max(cue.end, cue.start + 0.8));
      const plain = cue.text.replace(/\\N/g, '\n');
      const fs = fontSizeForText(plain);
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,{\\b1\\fs${fs}}${anim}${cue.fancyText}`;
    })
    .join('\n');

  return header + events + '\n';
}
