import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { parseVtt, buildAss, prepareDisplayCues } from './vtt-to-scenes.mjs';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (r.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
  return r;
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

  console.log(`[douyin] TTS (rate ${ttsRate})...`);
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
  writeFileSync(assPath, buildAss(cues), 'utf8');

  const assForFfmpeg = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  const dur = duration.toFixed(2);

  console.log('[douyin] ffmpeg ASS compositing 1080x1920 (voice only)...');
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

  return {
    assPath,
    cueCount: cues.length,
    renderer: 'ffmpeg-ass',
    ttsRate: opts.ttsRate,
  };
}
