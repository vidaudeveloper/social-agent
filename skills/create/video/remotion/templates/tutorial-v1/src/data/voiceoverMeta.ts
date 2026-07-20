import raw from '../../public/voiceover-meta.json';
import {beats} from './beats';

export type VoiceoverBeat = {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  durationSec: number;
};

export type VoiceoverMeta = {
  audioFile: string;
  totalSec: number;
  fps: number;
  totalFrames: number;
  beats: VoiceoverBeat[];
};

export const voiceoverMeta = raw as VoiceoverMeta;
export const COMPOSITION_FPS = voiceoverMeta.fps;
export const TOTAL_FRAMES = voiceoverMeta.totalFrames;
export const beatList = beats;

/**
 * Per-beat duration in frames = nextStart - start (includes inter-beat silence).
 * Keeps Series timeline aligned with the single-track voiceover.
 */
export function beatFrames(): number[] {
  const list = voiceoverMeta.beats;
  const frames = list.map((b, i) => {
    const nextStart = i + 1 < list.length ? list[i + 1].startSec : voiceoverMeta.totalSec;
    const dur = Math.max(0.05, nextStart - b.startSec);
    return Math.max(1, Math.round(dur * COMPOSITION_FPS));
  });
  const sum = frames.reduce((a, b) => a + b, 0);
  const diff = TOTAL_FRAMES - sum;
  if (diff !== 0 && frames.length > 0) {
    frames[frames.length - 1] += diff;
  }
  return frames;
}

export function getCaptionAtSec(sec: number): string | null {
  const b = voiceoverMeta.beats.find((x) => sec >= x.startSec && sec < x.endSec);
  return b?.text ?? null;
}
