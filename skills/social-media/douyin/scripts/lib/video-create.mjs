import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { resolveRenderer } from './renderer.mjs';
import { synthesizeTts, renderFfmpegAss } from './video-create-ffmpeg.mjs';
import { renderFfcreator } from './video-create-ffcreator.mjs';

/**
 * @param {{ text: string, voice: string, outputDir: string, basename: string }} opts
 */
export async function createDouyinTextVideo(opts) {
  const {
    text,
    voice,
    outputDir,
    basename,
    ttsRate = '+50%',
  } = opts;

  mkdirSync(outputDir, { recursive: true });
  const workDir = join(outputDir, basename);
  const videoPath = join(outputDir, `${basename}.mp4`);

  const tts = synthesizeTts({ text, voice, workDir, ttsRate });
  if (!existsSync(tts.voicePath)) {
    throw new Error(`TTS output missing: ${tts.voicePath}`);
  }

  const renderOpts = {
    voicePath: tts.voicePath,
    vttPath: tts.vttPath,
    workDir,
    videoPath,
    duration: tts.duration,
    ttsRate,
  };

  const renderer = resolveRenderer();
  let renderResult;

  if (renderer === 'ffcreator') {
    try {
      console.log('[douyin] renderer: FFCreator');
      renderResult = await renderFfcreator(renderOpts);
    } catch (err) {
      console.warn('[douyin] FFCreator failed, fallback ffmpeg ASS:', err.message);
      renderResult = renderFfmpegAss(renderOpts);
    }
  } else {
    console.log('[douyin] renderer: ffmpeg ASS (Windows default)');
    renderResult = renderFfmpegAss(renderOpts);
  }

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
  };
}
