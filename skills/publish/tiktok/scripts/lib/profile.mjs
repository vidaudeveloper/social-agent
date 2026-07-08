import { existsSync, readFileSync } from 'fs';
import { resolveVoice } from '../../../douyin/scripts/lib/voices.mjs';
import { profilePath } from './paths.mjs';
import { DEFAULT_MAX_DURATION_SEC, DEFAULT_MIN_DURATION_SEC } from './duration-limit.mjs';

export const DEFAULT_VOICE_PRESET = 'us-male';

export function loadTiktokProfile() {
  const defaultVoice = resolveVoice(DEFAULT_VOICE_PRESET);

  const defaults = {
    voice: defaultVoice.voiceId,
    voicePreset: defaultVoice.presetId,
    voiceLabel: defaultVoice.label,
    voiceInput: DEFAULT_VOICE_PRESET,
    hashtags: '#fyp #TikTokShop',
    style: 'fancy-text-black',
    ttsRate: '+50%',
    maxDurationSec: DEFAULT_MAX_DURATION_SEC,
    minDurationSec: DEFAULT_MIN_DURATION_SEC,
  };

  if (!existsSync(profilePath)) {
    return defaults;
  }

  const text = readFileSync(profilePath, 'utf8');
  const section = text.match(/## TikTok 配置[\s\S]*?(?=\n## |$)/);
  if (!section) {
    return defaults;
  }

  const sectionText = section[0];
  const getInSection = (key) => {
    const m = sectionText.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  const voiceRaw = getInSection('TTS 音色') || process.env.TIKTOK_TTS_VOICE || DEFAULT_VOICE_PRESET;
  let resolved = resolveVoice(voiceRaw);
  if (!resolved.voiceId.startsWith('en-')) {
    resolved = resolveVoice(DEFAULT_VOICE_PRESET);
  }

  const maxRaw = getInSection('视频时长上限') || process.env.TIKTOK_MAX_DURATION_SEC || '';
  const minRaw = getInSection('视频时长下限') || process.env.TIKTOK_MIN_DURATION_SEC || '';
  const maxDurationSec = Number(maxRaw) || defaults.maxDurationSec;
  const minDurationSec = Number(minRaw) || defaults.minDurationSec;

  return {
    voice: resolved.voiceId,
    voicePreset: resolved.presetId,
    voiceLabel: resolved.label,
    voiceInput: voiceRaw,
    hashtags: getInSection('默认标签') || defaults.hashtags,
    style: getInSection('视频样式') || defaults.style,
    ttsRate: getInSection('TTS 语速') || process.env.TIKTOK_TTS_RATE || defaults.ttsRate,
    maxDurationSec: Math.min(120, Math.max(30, maxDurationSec)),
    minDurationSec: Math.min(maxDurationSec, Math.max(15, minDurationSec)),
  };
}

export function resolveTiktokVoice(voiceOverride, profile) {
  const raw = voiceOverride || profile.voiceInput || DEFAULT_VOICE_PRESET;
  const resolved = resolveVoice(raw);
  if (resolved.voiceId.startsWith('en-')) {
    return resolved;
  }
  return resolveVoice(DEFAULT_VOICE_PRESET);
}
