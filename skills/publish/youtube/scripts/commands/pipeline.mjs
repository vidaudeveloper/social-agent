import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { contentRoot } from '../lib/paths.mjs';
import { loadUserProfile } from '../lib/profile.mjs';
import { createVideoFromScript } from '../lib/video-create.mjs';

const cliDir = dirname(fileURLToPath(import.meta.url));

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const DEFAULT_SCRIPT = `Still selling only on TikTok Shop in 2026? You are leaving money on the table.
Smart sellers run a dual-store model: TikTok Shop for discovery, and a DTC store for profit and repeat buyers.

Here is the playbook in sixty seconds.

First, product selection on TikTok Shop. Use this formula: visual impact times scene fit, divided by decision friction.
If users need ten seconds to understand the product, it will not convert.
Example: a magnetic phone stand, cost four fifty, sells at nineteen ninety-nine. Seventy-two percent margin, two thousand orders a month.

Second, ads. Cold start at fifty dollars per day. When you find winners, switch to GMV Max and target two point zero ROAS before scaling.

Third, the trap. Inventory must sync across both stores.
One seller had three hundred TikTok orders and two hundred web orders, but only three hundred units in stock. Forty percent refunds and a crashed store rating.

Under three thousand dollars budget? Start with TikTok Shop only. Build cash flow, then add the DTC store for repeat purchases.

Which stage are you in: TikTok only, DTC only, or dual-store? Comment below.`;

/**
 * @param {string[]} argv
 * @returns {Record<string, string>}
 */
function parseCreateVideoArgs(argv) {
  /** @type {Record<string, string>} */
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--script-file' || a === '--title' || a === '--slug') {
      opts[a.slice(2)] = argv[++i] ?? '';
    }
  }
  return opts;
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function loadVoiceoverFromFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const section = raw.match(/##\s*Voiceover Script\s*\n+([\s\S]*?)(?:\n##\s|$)/i);
  if (section) return section[1].trim();
  return raw.replace(/^#.*$/m, '').trim();
}

export async function cmdCreateVideo(argv) {
  const profile = loadUserProfile();
  const opts = parseCreateVideoArgs(argv);
  const ts = stamp();
  const slug = opts.slug || process.env.VIDEO_SLUG || 'youtube-video';
  const title =
    opts.title || process.env.VIDEO_TITLE || 'TikTok Shop + DTC Store: Dual-Store Playbook for 2026';

  let text = process.env.VIDEO_SCRIPT || '';
  let scriptPath = opts['script-file'] || process.env.VIDEO_SCRIPT_FILE || '';

  if (scriptPath) {
    text = loadVoiceoverFromFile(scriptPath);
  } else if (!text) {
    text = DEFAULT_SCRIPT;
  }

  const scriptDir = join(contentRoot, '文章', 'YouTube');
  const videoDir = join(contentRoot, '视频');
  mkdirSync(scriptDir, { recursive: true });

  if (!scriptPath) {
    scriptPath = join(scriptDir, `${ts}_${slug}.md`);
    writeFileSync(
      scriptPath,
      `# ${title}\n\n## Voiceover Script\n\n${text}\n`,
      'utf8',
    );
  }

  const { videoPath } = createVideoFromScript({
    text,
    voice: profile.voice,
    outputDir: videoDir,
    basename: `${ts}_${slug}`,
  });

  console.log(JSON.stringify({ ok: true, scriptPath, videoPath }, null, 2));
}

export async function cmdPipeline() {
  const profile = loadUserProfile();
  const ts = stamp();
  const slug = 'TK-Dual-Store-Playbook-2026';
  const title =
    process.env.VIDEO_TITLE ||
    'TikTok Shop + DTC Store: Dual-Store Playbook for 2026';
  const description = `How to run TikTok Shop for testing and a DTC store for retention.
3 product criteria | GMV Max at 2.0 ROAS | inventory sync warning
Channel: ${profile.channelId}`;
  const text = process.env.VIDEO_SCRIPT || DEFAULT_SCRIPT;

  const scriptDir = join(contentRoot, '文章', 'YouTube');
  const videoDir = join(contentRoot, '视频');
  mkdirSync(scriptDir, { recursive: true });

  const scriptPath = join(scriptDir, `${ts}_${slug}.md`);
  writeFileSync(
    scriptPath,
    `# ${title}\n\n## Description\n${description}\n\n## Voiceover Script\n\n${text}\n`,
    'utf8'
  );

  console.log('=== skills/publish/youtube · 全流程 ===\n');
  console.log('用户画像:', profile.industry, '| 频道', profile.channelId);
  console.log('口播稿:', scriptPath);

  const { videoPath } = createVideoFromScript({
    text,
    voice: profile.voice,
    outputDir: videoDir,
    basename: `${ts}_${slug}`,
  });

  process.env.YOUTUBE_CHANNEL_ID = profile.channelId;
  process.env.VIDEO_PRIVACY = profile.privacy;

  const cliPath = join(cliDir, '../cli.mjs');
  const r = spawnSync(
    'node',
    [cliPath, 'publish', '--video', videoPath, '--title', title, '--description', description, '--privacy', profile.privacy],
    { stdio: 'inherit', shell: true }
  );
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }

  const reportPath = join(contentRoot, `${ts}_youtube发布报告.md`);
  writeFileSync(
    reportPath,
    `# YouTube 发布报告 - ${ts}\n\n| 项目 | 值 |\n|------|-----|\n| 标题 | ${title} |\n| 视频 | ${videoPath} |\n| 脚本 | ${scriptPath} |\n| 可见性 | ${profile.privacy} |\n| 频道 | ${profile.channelId} |\n`,
    'utf8'
  );

  console.log('\n✅ 全流程完成');
  console.log('报告:', reportPath);
}
