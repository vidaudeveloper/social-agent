import { existsSync, readFileSync } from 'fs';
import { profilePath } from './paths.mjs';

export function loadUserProfile() {
  if (!existsSync(profilePath)) {
    throw new Error(
      `缺少用户画像: ${profilePath}\n请从 ${profilePath.replace('user-profile.md', 'user-profile.template.md')} 复制并填写`
    );
  }
  const text = readFileSync(profilePath, 'utf8');
  const get = (key) => {
    const m = text.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  return {
    industry: get('行业'),
    channelId: get('频道 ID') || 'me',
    voice: get('TTS 音色') || 'en-US-JennyNeural',
    privacy: get('默认可见性') || 'unlisted',
    studioLang: get('Studio 语言') || 'English',
  };
}
