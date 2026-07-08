import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename as pathBasename } from 'path';
import { hermesRoot } from '../lib/paths.mjs';
import { loadDouyinProfile } from '../lib/profile.mjs';
import { parseDouyinScript } from '../lib/script-parse.mjs';
import { createDouyinTextVideo } from '../lib/video-create.mjs';
import { resolveVoice } from '../lib/voices.mjs';

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
    if (a === '--file' || a === '-f') file = argv[++i] || '';
    else if (a === '--slug' || a === '-s') slug = argv[++i] || '';
    else if (a === '--out' || a === '-o') outDir = argv[++i] || '';
    else if (a === '--voice' || a === '-v') voiceOverride = argv[++i] || '';
  }

  const articleDir = join(hermesRoot, '文章', '抖音');
  if (!file && slug) {
    const candidates = [
      join(articleDir, `${slug}.md`),
      join(articleDir, `${slug}_抖音.md`),
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

  const profile = loadDouyinProfile();
  const voiceResolved = resolveVoice(voiceOverride || profile.voiceInput || profile.voice);
  const raw = readFileSync(file, 'utf8');
  const parsed = parseDouyinScript(raw);

  if (!parsed.plainText || parsed.plainText.length < 20) {
    throw new Error('Script too short after parsing');
  }

  const baseFromFile = pathBasename(file, '.md').replace(/_抖音$/, '');
  const ts = stamp();
  const videoBasename = `${ts}_${baseFromFile}`;
  const videoDir = outDir || join(hermesRoot, '视频', baseFromFile);

  mkdirSync(videoDir, { recursive: true });

  console.log('[douyin:create-video] file:', file);
  console.log('[douyin:create-video] title:', parsed.title);
  console.log('[douyin:create-video] chars:', parsed.plainText.length);
  console.log('[douyin:create-video] voice:', voiceResolved.voiceId, `(${voiceResolved.label})`);
  console.log('[douyin:create-video] tts rate:', profile.ttsRate);

  const result = await createDouyinTextVideo({
    text: parsed.plainText,
    voice: voiceResolved.voiceId,
    outputDir: videoDir,
    basename: videoBasename,
    ttsRate: profile.ttsRate,
  });

  const manifest = {
    ok: true,
    title: parsed.title,
    hashtags: profile.hashtags,
    scriptFile: file,
    videoPath: result.videoPath,
    voicePath: result.voicePath,
    duration: result.duration,
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
