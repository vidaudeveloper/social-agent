import { createRequire } from 'module';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { renderFfmpegAss } from './video-create-ffmpeg.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = join(__dirname, '../..');

/**
 * FFCreator renderer (optional; requires skills/douyin/node_modules/ffcreator).
 * Windows 默认不可用（canvas 原生依赖），失败时由上层回退 ffmpeg。
 *
 * @param {{ voicePath: string, vttPath: string, workDir: string, videoPath: string, duration: number }} opts
 */
export async function renderFfcreator(opts) {
  const require = createRequire(import.meta.url);
  const ffcPath = join(skillRoot, 'node_modules/ffcreator');
  let FFCreator;
  let FFScene;
  let FFText;
  try {
    ({ FFCreator, FFScene, FFText } = require(join(ffcPath, 'lib/index.js')));
  } catch {
    throw new Error('FFCreator not installed. Run: npm run douyin:install (Linux/macOS only)');
  }

  const { parseVtt } = await import('./vtt-to-scenes.mjs');
  const cues = parseVtt(opts.vttPath);
  if (!cues.length) {
    throw new Error(`No subtitles for FFCreator: ${opts.vttPath}`);
  }

  const cacheDir = join(opts.workDir, 'ffc-cache');
  const outputDir = join(opts.workDir, 'ffc-out');
  const animations = ['fadeInUp', 'bounceIn', 'zoomIn'];

  return new Promise((resolve, reject) => {
    const creator = new FFCreator({
      cacheDir,
      outputDir,
      width: 1080,
      height: 1920,
      output: opts.videoPath,
      audio: opts.voicePath,
    });

    const scene = new FFScene();
    scene.setBgColor('#000000');
    scene.setDuration(opts.duration);
    scene.addAudio(opts.voicePath);

    cues.forEach((cue, i) => {
      const text = new FFText({
        text: cue.text,
        x: 540,
        y: 960,
        style: {
          fontSize: 72,
          fill: '#ffffff',
          stroke: '#000000',
          strokeThickness: 4,
        },
      });
      text.setStartTime(cue.start);
      text.setEndTime(cue.end);
      text.addEffect(animations[i % animations.length]);
      scene.addChild(text);
    });

    creator.addScene(scene);
    creator.on('complete', () => {
      resolve({ cueCount: cues.length, renderer: 'ffcreator' });
    });
    creator.on('error', reject);
    creator.start();
  });
}

export { renderFfmpegAss };
