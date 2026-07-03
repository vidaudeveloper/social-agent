import { existsSync, readFileSync } from 'fs';
import { profilePath } from './paths.mjs';
import { resolveVoice, DEFAULT_VOICE_PRESET } from './voices.mjs';

export function loadDouyinProfile() {
  const defaultVoice = resolveVoice(DEFAULT_VOICE_PRESET);

  const defaults = {
    voice: defaultVoice.voiceId,
    voicePreset: defaultVoice.presetId,
    voiceLabel: defaultVoice.label,
    voiceInput: DEFAULT_VOICE_PRESET,
    hashtags: '#跨境电商 #TikTokShop',
    style: 'fancy-text-black',
    ttsRate: '+50%',
  };

  if (!existsSync(profilePath)) {
    return defaults;
  }

  const text = readFileSync(profilePath, 'utf8');
  const section = text.match(/## 抖音配置[\s\S]*?(?=\n## |$)/);
  if (!section) {
    return defaults;
  }

  const sectionText = section[0];

  const getInSection = (key) => {
    const m = sectionText.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  const voiceRaw = getInSection('TTS 音色') || process.env.DOUYIN_TTS_VOICE || DEFAULT_VOICE_PRESET;
  const resolved = resolveVoice(voiceRaw);

  return {
    voice: resolved.voiceId,
    voicePreset: resolved.presetId,
    voiceLabel: resolved.label,
    voiceInput: voiceRaw,
    hashtags: getInSection('默认话题') || defaults.hashtags,
    style: getInSection('视频样式') || defaults.style,
    ttsRate: getInSection('TTS 语速') || process.env.DOUYIN_TTS_RATE || defaults.ttsRate,
  };
}
