import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { defaultBgImage } from './paths.mjs';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    throw new Error(`命令失败: ${cmd} ${args.join(' ')}`);
  }
}

/**
 * @param {{ text: string, voice: string, bgImage?: string, outputDir: string, basename: string }} opts
 * @returns {{ videoPath: string, voicePath: string }}
 */
export function createVideoFromScript(opts) {
  const { text, voice, outputDir, basename } = opts;
  const bgImage = opts.bgImage || defaultBgImage;

  mkdirSync(outputDir, { recursive: true });
  const ttsTextPath = join(outputDir, `${basename}_tts.txt`);
  const voicePath = join(outputDir, `${basename}_voice.mp3`);
  const videoPath = join(outputDir, `${basename}.mp4`);

  writeFileSync(ttsTextPath, text, 'utf8');

  console.log('TTS 配音...');
  run('uv', ['run', 'edge-tts', '--voice', voice, '--file', ttsTextPath, '--write-media', voicePath]);

  if (!existsSync(bgImage)) {
    throw new Error(`背景图不存在: ${bgImage}`);
  }

  console.log('合成 16:9 视频...');
  run('ffmpeg', [
    '-y',
    '-loop',
    '1',
    '-i',
    bgImage,
    '-i',
    voicePath,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720',
    '-c:a',
    'aac',
    '-shortest',
    videoPath,
  ]);

  return { videoPath, voicePath };
}
