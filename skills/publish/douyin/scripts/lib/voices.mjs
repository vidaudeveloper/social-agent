/**
 * Edge TTS 音色预设（免费，无需 API Key）
 * 配置项可填「预设 ID」或完整 voice 名（如 zh-CN-YunxiNeural）
 */

/** @type {Record<string, { id: string, label: string, locale: string, gender: string, desc: string }>} */
export const VOICE_PRESETS = {
  'cn-male': {
    id: 'zh-CN-YunxiNeural',
    label: '国内男声（默认）',
    locale: 'zh-CN',
    gender: 'male',
    desc: '阳光、活泼，适合口播干货',
  },
  'cn-male-pro': {
    id: 'zh-CN-YunyangNeural',
    label: '国内男声·专业',
    locale: 'zh-CN',
    gender: 'male',
    desc: '新闻播音感，沉稳可信',
  },
  'cn-male-passion': {
    id: 'zh-CN-YunjianNeural',
    label: '国内男声·激情',
    locale: 'zh-CN',
    gender: 'male',
    desc: '更有力量感，适合强调卖点',
  },
  'cn-female': {
    id: 'zh-CN-XiaoxiaoNeural',
    label: '国内女声',
    locale: 'zh-CN',
    gender: 'female',
    desc: '温暖亲切，适合种草讲解',
  },
  'cn-female-lively': {
    id: 'zh-CN-XiaoyiNeural',
    label: '国内女声·活泼',
    locale: 'zh-CN',
    gender: 'female',
    desc: '轻快活泼，适合短视频节奏',
  },
  'us-male': {
    id: 'en-US-AndrewNeural',
    label: '海外男声·美式',
    locale: 'en-US',
    gender: 'male',
    desc: '美式英语，自信自然（英文稿）',
  },
  'us-female': {
    id: 'en-US-JennyNeural',
    label: '海外女声·美式',
    locale: 'en-US',
    gender: 'female',
    desc: '美式英语，友好清晰（英文稿）',
  },
  'us-male-casual': {
    id: 'en-US-BrianNeural',
    label: '海外男声·美式休闲',
    locale: 'en-US',
    gender: 'male',
    desc: '美式口语，轻松随和',
  },
  'us-female-warm': {
    id: 'en-US-AriaNeural',
    label: '海外女声·美式自信',
    locale: 'en-US',
    gender: 'female',
    desc: '美式英语，自信明快',
  },
  'uk-male': {
    id: 'en-GB-RyanNeural',
    label: '海外男声·英式',
    locale: 'en-GB',
    gender: 'male',
    desc: '英式英语男声',
  },
  'uk-female': {
    id: 'en-GB-SoniaNeural',
    label: '海外女声·英式',
    locale: 'en-GB',
    gender: 'female',
    desc: '英式英语女声',
  },
};

export const DEFAULT_VOICE_PRESET = 'cn-male';

/**
 * @param {string} input 预设 ID、中文别名或完整 voice 名
 * @returns {{ presetId: string, voiceId: string, label: string }}
 */
export function resolveVoice(input) {
  const raw = (input || '').trim();
  if (!raw) {
    return presetToResult(DEFAULT_VOICE_PRESET);
  }

  if (VOICE_PRESETS[raw]) {
    return presetToResult(raw);
  }

  const alias = Object.entries(VOICE_PRESETS).find(
    ([, v]) => v.id.toLowerCase() === raw.toLowerCase() || v.label === raw
  );
  if (alias) {
    return presetToResult(alias[0]);
  }

  return {
    presetId: 'custom',
    voiceId: raw,
    label: raw,
  };
}

/**
 * @param {string} presetId
 */
function presetToResult(presetId) {
  const p = VOICE_PRESETS[presetId];
  return {
    presetId,
    voiceId: p.id,
    label: p.label,
  };
}

export function listVoicePresets() {
  return Object.entries(VOICE_PRESETS).map(([id, v]) => ({
    preset: id,
    voice: v.id,
    label: v.label,
    locale: v.locale,
    gender: v.gender,
    desc: v.desc,
  }));
}

export function formatVoiceCatalogText() {
  const groups = [
    { title: '国内男声', filter: (v) => v.locale === 'zh-CN' && v.gender === 'male' },
    { title: '国内女声', filter: (v) => v.locale === 'zh-CN' && v.gender === 'female' },
    { title: '海外男声', filter: (v) => v.gender === 'male' && v.locale.startsWith('en') },
    { title: '海外女声', filter: (v) => v.gender === 'female' && v.locale.startsWith('en') },
  ];

  const lines = ['Edge TTS 音色预设（npm run douyin:voices）', ''];
  for (const g of groups) {
    lines.push(`## ${g.title}`);
    for (const item of listVoicePresets().filter(g.filter)) {
      lines.push(`- ${item.preset} → ${item.voice}（${item.label}）${item.desc}`);
    }
    lines.push('');
  }
  lines.push('在 user-profile.md 的「抖音配置」填写：');
  lines.push('- TTS 音色: cn-male          # 预设 ID（推荐）');
  lines.push('- TTS 音色: zh-CN-XiaoxiaoNeural  # 或完整 voice 名');
  return lines.join('\n');
}
