#!/usr/bin/env node
/**
 * 为 tiktok-ip-lycheeip Remotion 项目生成旁白 + 字幕时间轴
 */
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', '视频', 'remotion', 'tiktok-ip-lycheeip');
const publicDir = join(projectRoot, 'public');
const audioPath = join(publicDir, 'voiceover.mp3');
const vttPath = join(publicDir, 'captions.vtt');
const metaPath = join(publicDir, 'voiceover-meta.json');

const segments = [
  { id: 'hook', text: '别再被 TikTok 运营的玄学坑了！低播放、IP 违规，百分之五十的问题，其实都在网络环境。' },
  { id: 'problem', text: '早期机场早已失效，自建机房 IP 风险越来越高，黑盒线路更是坑多。' },
  { id: 'solution', text: '靠谱方案是 VPS 搭节点，再加纯净独享住宅 IP 做出口，业内叫链式代理，模拟真实家庭网络。' },
  { id: 'steps', text: '三步搞定：先确保境外基础网络，再把住宅 IP 填进指纹浏览器，最后检测 IP 地区与伪装度，绿色就是通过。' },
  { id: 'cta', text: '推荐 Lychee IP，多国家静态住宅可选，支持常用支付，官网 lycheeip.com，适合 TikTok 精细化运营。' },
  { id: 'close', text: '别想低成本薅羊毛，但也别怕，先做起来边做边学，网络搭对了，少走三个月弯路！' },
];

mkdirSync(publicDir, { recursive: true });

const fullText = segments.map((s) => s.text).join('');
const scriptFile = join(publicDir, 'narration.txt');
writeFileSync(scriptFile, fullText, 'utf8');

console.log('[tts] generating voiceover...');
const tts = spawnSync('uv', ['run', 'edge-tts', '--voice', 'zh-CN-YunxiNeural', '--rate', '+5%', '-f', scriptFile, '--write-media', audioPath], {
  encoding: 'utf8',
  shell: true,
});
if (tts.status !== 0) {
  console.error(tts.stderr || tts.stdout);
  process.exit(1);
}

function probeDurationSec(file) {
  const r = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) return null;
  return parseFloat(r.stdout.trim());
}

let totalSec = probeDurationSec(audioPath);
if (!totalSec || Number.isNaN(totalSec)) {
  console.warn('[warn] ffprobe failed, estimate duration from text length');
  totalSec = fullText.length / 4.5;
}

const charWeights = segments.map((s) => s.text.length);
const weightSum = charWeights.reduce((a, b) => a + b, 0);
let cursor = 0;
const timeline = segments.map((seg, i) => {
  const dur = (charWeights[i] / weightSum) * totalSec;
  const start = cursor;
  const end = cursor + dur;
  cursor = end;
  return { ...seg, startSec: start, endSec: end, durationSec: dur };
});

// WebVTT
const vttLines = ['WEBVTT', ''];
for (const item of timeline) {
  vttLines.push(`${formatVtt(item.startSec)} --> ${formatVtt(item.endSec)}`);
  vttLines.push(item.text);
  vttLines.push('');
}
writeFileSync(vttPath, vttLines.join('\n'), 'utf8');

const meta = {
  audioFile: 'voiceover.mp3',
  totalSec,
  fps: 30,
  totalFrames: Math.ceil(totalSec * 30),
  segments: timeline,
};
writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
console.log(`[done] audio: ${audioPath}`);
console.log(`[done] duration: ${totalSec.toFixed(2)}s, frames: ${meta.totalFrames}`);
console.log(`[done] captions: ${vttPath}`);

function formatVtt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${String(ms).padStart(3, '0')}`;
}
function pad(n) {
  return String(n).padStart(2, '0');
}
