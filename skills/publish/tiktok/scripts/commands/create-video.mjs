import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename as pathBasename } from 'path';
import { contentRoot } from '../lib/paths.mjs';
import { loadTiktokProfile, resolveTiktokVoice } from '../lib/profile.mjs';
import { parseTiktokScript } from '../lib/script-parse.mjs';
import { createTiktokTextVideo } from '../lib/video-create.mjs';
import { estimateDurationSec } from '../lib/duration-limit.mjs';

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/**
 * @param {string[]} argv
 */
export async function cmdCreateVideo(argv) {
  let file = '';
  let slug = '';
  let outDir = '';
  let voiceOverride = '';

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--file' || a === '-f' || a === '-File') file = argv[++i] || '';
    else if (a === '--slug' || a === '-s') slug = argv[++i] || '';
    else if (a === '--out' || a === '-o') outDir = argv[++i] || '';
    else if (a === '--voice' || a === '-v') voiceOverride = argv[++i] || '';
  }

  const articleDir = join(contentRoot, '文章', 'TikTok');
  if (!file && slug) {
    const candidates = [
      join(articleDir, `${slug}.md`),
      join(articleDir, `${slug}_TikTok.md`),
      join(articleDir, `${slug}_tiktok.md`),
    ];
    file = candidates.find((p) => existsSync(p)) || '';
    if (!file && existsSync(articleDir)) {
      const match = readdirSync(articleDir).find((n) => n.includes(slug) && n.endsWith('.md'));
      if (match) file = join(articleDir, match);
    }
  }

  if (!file || !existsSync(file)) {
    throw new Error(`Markdown not found. Use --file or --slug. Got: ${file || slug}`);
  }

  const profile = loadTiktokProfile();
  const voiceResolved = resolveTiktokVoice(voiceOverride, profile);
  const raw = readFileSync(file, 'utf8');
  const parsed = parseTiktokScript(raw);

  if (!parsed.sentences.length || parsed.plainText.length < 20) {
    throw new Error('Script too short after parsing');
  }

  const baseFromFile = pathBasename(file, '.md').replace(/_TikTok$/i, '').replace(/_tiktok$/, '');
  const ts = stamp();
  const videoBasename = `${ts}_${baseFromFile}`;
  const videoDir = outDir || join(contentRoot, '视频', 'TikTok', baseFromFile);

  mkdirSync(videoDir, { recursive: true });

  const estSec = estimateDurationSec(parsed.sentences, profile.ttsRate);

  console.log('[tiktok:create-video] file:', file);
  console.log('[tiktok:create-video] title:', parsed.title);
  console.log('[tiktok:create-video] sentences:', parsed.sentences.length);
  console.log(
    '[tiktok:create-video] est. duration:',
    `${estSec.toFixed(0)}s (min ${profile.minDurationSec}s, max ${profile.maxDurationSec}s)`
  );
  console.log('[tiktok:create-video] voice:', voiceResolved.voiceId, `(${voiceResolved.label})`);
  console.log('[tiktok:create-video] tts rate:', profile.ttsRate);

  const result = createTiktokTextVideo({
    sentences: parsed.sentences,
    voice: voiceResolved.voiceId,
    outputDir: videoDir,
    basename: videoBasename,
    ttsRate: profile.ttsRate,
    maxDurationSec: profile.maxDurationSec,
    minDurationSec: profile.minDurationSec,
  });

  const manifest = {
    ok: true,
    platform: 'tiktok',
    title: parsed.title,
    hashtags: profile.hashtags,
    scriptFile: file,
    videoPath: result.videoPath,
    voicePath: result.voicePath,
    duration: result.duration,
    maxDurationSec: profile.maxDurationSec,
    minDurationSec: profile.minDurationSec,
    truncated: result.truncated,
    textExpanded: result.textExpanded,
    sentenceCount: result.sentenceCount,
    cueCount: result.cueCount,
    voice: voiceResolved.voiceId,
    voicePreset: voiceResolved.presetId,
    voiceLabel: voiceResolved.label,
    style: profile.style,
    ttsRate: profile.ttsRate,
    renderer: result.renderer,
    createdAt: new Date().toISOString(),
  };

  const manifestPath = join(videoDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(JSON.stringify(manifest, null, 2));
}
