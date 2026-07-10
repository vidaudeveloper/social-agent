import { readFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';

/**
 * Parse WebVTT / similar subtitle file to plain text lines.
 * @param {string} vtt
 * @returns {string[]}
 */
export function parseVttToLines(vtt) {
  const lines = [];
  for (const raw of vtt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === 'WEBVTT' || line.startsWith('NOTE')) continue;
    if (/^\d+$/.test(line)) continue;
    if (/^\d{2}:\d{2}/.test(line) || line.includes('-->')) continue;
    const clean = line
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    if (clean) lines.push(clean);
  }
  // dedupe consecutive identical (auto-subs repeat)
  const deduped = [];
  for (const l of lines) {
    if (deduped[deduped.length - 1] !== l) deduped.push(l);
  }
  return deduped;
}

/**
 * @param {string} videoId
 * @param {string} lang
 * @returns {{ fullText: string, segments: { text: string }[] } | null}
 */
export function extractSubtitlesYtdlp(videoId, lang = 'en') {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const outBase = join(tmpdir(), `yt-sub-${videoId}`);
  const outTpl = `${outBase}.%(ext)s`;

  const args = [
    'run',
    'yt-dlp',
    '--write-auto-sub',
    '--write-sub',
    '--sub-lang',
    lang,
    '--skip-download',
    '-o',
    outTpl,
    url,
  ];

  spawnSync('uv', args, { encoding: 'utf8', shell: true });

  const dir = tmpdir();
  const prefix = `yt-sub-${videoId}`;
  const files = readdirSync(dir).filter(
    (f) => f.startsWith(prefix) && (f.endsWith('.vtt') || f.endsWith('.srt')),
  );

  if (!files.length) return null;

  const vttPath = join(dir, files[0]);
  const vtt = readFileSync(vttPath, 'utf8');
  try {
    unlinkSync(vttPath);
  } catch {
    // ignore cleanup errors
  }

  const lines = parseVttToLines(vtt);
  const fullText = lines.join(' ');
  return {
    fullText,
    segments: lines.map((text) => ({ text })),
  };
}
