import { listVoicePresets } from '../../../douyin/scripts/lib/voices.mjs';

export async function cmdListVoices() {
  const en = listVoicePresets().filter((v) => v.locale.startsWith('en'));
  console.log('TikTok 英文 TTS 音色（Edge TTS）\n');
  for (const item of en) {
    console.log(`- ${item.preset} → ${item.voice}（${item.label}）`);
  }
  console.log('\n默认: us-male → en-US-AndrewNeural');
  console.log(JSON.stringify(en, null, 2));
}
