import { formatVoiceCatalogText, listVoicePresets } from '../lib/voices.mjs';

export async function cmdListVoices() {
  console.log(formatVoiceCatalogText());
  console.log(JSON.stringify(listVoicePresets(), null, 2));
}
