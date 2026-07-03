import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { parseVtt, formatAssTime } from '../../../douyin/scripts/lib/vtt-to-scenes.mjs';
import { toFancyAssText } from '../../../douyin/scripts/lib/fancy-text.mjs';
import { cuesForDisplay } from '../../../douyin/scripts/lib/display-text.mjs';
import { splitAndWrapCues, fontSizeForText } from './text-wrap-en.mjs';
import { trimSentencesToDuration, expandSentencesToMinDuration } from './duration-limit.mjs';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function probeDuration(mediaPath) {
  const r = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      mediaPath,
    ],
    { encoding: 'utf8', shell: true }
  );
  if (r.status !== 0) return 30;
  const n = Number.parseFloat((r.stdout || '').trim());
  return Number.isFinite(n) && n > 0 ? n : 30;
}

/**
 * @param {{ text: string, voice: string, workDir: string, ttsRate?: string }} opts
 */
export function synthesizeTts(opts) {
  const { text, voice, workDir, ttsRate = '+50%' } = opts;
  mkdirSync(workDir, { recursive: true });

  const ttsTextPath = join(workDir, 'tts.txt');
  const voicePath = join(workDir, 'voice.mp3');
  const vttPath = join(workDir, 'subs.vtt');

  writeFileSync(ttsTextPath, text, 'utf8');

  console.log(`[tiktok] TTS (rate ${ttsRate})...`);
  run('uv', [
    'run',
    'edge-tts',
    '--voice',
    voice,
    '--rate',
    ttsRate,
    '--file',
    ttsTextPath,
    '--write-media',
    voicePath,
    '--write-subtitles',
    vttPath,
  ]);

  return { voicePath, vttPath, duration: probeDuration(voicePath) + 0.5 };
}

function prepareDisplayCues(cues) {
  return splitAndWrapCues(cuesForDisplay(cues), (line, baseFs) =>
    toFancyAssText(line, baseFs)
  );
}

function buildAssEn(cues) {
  const fontName = 'Segoe UI';
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},76,&H00FFFFFF,&H000000FF,&H00000000,&HC0000000,-1,0,0,0,100,100,0,0,1,6,4,5,56,56,120,1

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

/**
 * @param {{ voicePath: string, vttPath: string, workDir: string, videoPath: string, duration: number }} opts
 */
export function renderFfmpegAss(opts) {
  const { voicePath, vttPath, workDir, videoPath, duration } = opts;

  const rawCues = parseVtt(vttPath);
  const cues = prepareDisplayCues(rawCues);
  if (!cues.length) {
    throw new Error(`No subtitles parsed from: ${vttPath}`);
  }

  const assPath = join(workDir, 'subs.ass');
  writeFileSync(assPath, buildAssEn(cues), 'utf8');

  const assForFfmpeg = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  const dur = duration.toFixed(2);

  console.log('[tiktok] ffmpeg ASS compositing 1080x1920 (voice only)...');
  run('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=black:s=1080x1920:d=${dur}`,
    '-i',
    voicePath,
    '-vf',
    `ass='${assForFfmpeg}'`,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-shortest',
    videoPath,
  ]);

  return { assPath, cueCount: cues.length, renderer: 'ffmpeg-ass-en' };
}

/**
 * @param {{ sentences: string[], voice: string, outputDir: string, basename: string, ttsRate?: string, maxDurationSec?: number, minDurationSec?: number }} opts
 */
export function createTiktokTextVideo(opts) {
  const {
    sentences: allSentences,
    voice,
    outputDir,
    basename,
    ttsRate = '+50%',
    maxDurationSec = 90,
    minDurationSec = 60,
  } = opts;

  mkdirSync(outputDir, { recursive: true });
  const workDir = join(outputDir, basename);
  const videoPath = join(outputDir, `${basename}.mp4`);

  const expanded = expandSentencesToMinDuration(
    allSentences,
    minDurationSec,
    maxDurationSec,
    ttsRate
  );
  let sentences = expanded.sentences;
  let textExpanded = expanded.expanded;

  const preTrim = trimSentencesToDuration(sentences, maxDurationSec * 0.92, ttsRate);
  sentences = preTrim.sentences;
  let truncated = preTrim.truncated;
  let text = sentences.join(' ');

  let tts = synthesizeTts({ text, voice, workDir, ttsRate });

  if (textExpanded) {
    console.log(
      `[tiktok] Text expanded for min ${minDurationSec}s (+${expanded.addedSentences} sentences, rate ${ttsRate} unchanged)`
    );
  }

  let attempts = 0;

  while (tts.duration > maxDurationSec + 1.5 && sentences.length > 4 && attempts < 10) {
    const drop = Math.max(1, Math.ceil(sentences.length * 0.06));
    sentences = sentences.slice(0, -drop);
    truncated = true;
    text = sentences.join(' ');
    tts = synthesizeTts({ text, voice, workDir, ttsRate });
    attempts += 1;
  }

  if (tts.duration > maxDurationSec + 2) {
    throw new Error(
      `[tiktok] Duration ${tts.duration.toFixed(1)}s exceeds max ${maxDurationSec}s after trim. Shorten the script.`
    );
  }

  if (tts.duration < minDurationSec - 2) {
    const more = expandSentencesToMinDuration(sentences, minDurationSec, maxDurationSec, ttsRate);
    if (more.expanded) {
      textExpanded = true;
      sentences = more.sentences;
      text = sentences.join(' ');
      tts = synthesizeTts({ text, voice, workDir, ttsRate });
      console.log(
        `[tiktok] Re-expanded after TTS (${tts.duration.toFixed(1)}s target min ${minDurationSec}s)`
      );
    }
  }

  if (tts.duration < minDurationSec - 2) {
    throw new Error(
      `[tiktok] Duration ${tts.duration.toFixed(1)}s below min ${minDurationSec}s. Lengthen the English script.`
    );
  }

  if (truncated) {
    console.log(
      `[tiktok] Script trimmed to ~${tts.duration.toFixed(1)}s (max ${maxDurationSec}s), ${sentences.length} sentences`
    );
  }

  const renderResult = renderFfmpegAss({
    voicePath: tts.voicePath,
    vttPath: tts.vttPath,
    workDir,
    videoPath,
    duration: tts.duration,
  });

  return {
    videoPath,
    voicePath: tts.voicePath,
    vttPath: tts.vttPath,
    assPath: join(workDir, 'subs.ass'),
    workDir,
    duration: tts.duration,
    cueCount: renderResult.cueCount,
    renderer: renderResult.renderer,
    ttsRate,
    minDurationSec,
    sentenceCount: sentences.length,
    truncated,
    textExpanded: textExpanded,
    plainText: text,
  };
}
