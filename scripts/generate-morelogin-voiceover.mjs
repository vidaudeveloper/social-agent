#!/usr/bin/env node
/**
 * MoreLogin 教程：逐 beat ElevenLabs 配音 → voiceover-meta.json
 */
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const profileRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(profileRoot, 'content', '视频', 'remotion', 'morelogin-tutorial');
const publicDir = join(projectRoot, 'public');
const audioPath = join(publicDir, 'voiceover.mp3');
const vttPath = join(publicDir, 'captions.vtt');
const metaPath = join(publicDir, 'voiceover-meta.json');
const tmpDir = join(publicDir, '_tts_parts');

const beats = [
  { id: 'o1', text: '不管你是做跨境多店、海外社媒，还是多账号矩阵运营。' },
  { id: 'o2', text: '最怕一件事：账号好好的，突然要验证，甚至直接被封。' },
  { id: 'o3', text: '很多人换了代理，该封还是封——问题往往不在「有没有代理」，而在「代理和环境对不对」。' },
  { id: 'r1', text: '平台风控看的不只是你是不是真人，而是这套环境像不像本地真实用户。' },
  { id: 'r2', text: '常见原因一：多账号共用同一出口 IP，别人的历史行为会污染你的账号。' },
  { id: 'r3', text: '原因二：机房或数据中心 IP 特征明显，跨区登录时更容易被标成高风险。' },
  { id: 'r4', text: '原因三：指纹、时区、语言和 IP 地区对不上，环境拼凑感太强。' },
  { id: 'r5', text: '所以要同时做对两件事：选对代理类型，再配进隔离的指纹浏览器环境。' },
  { id: 'c1', text: '配代理前先分清：共享节点、机房 IP、静态住宅 IP，对应的风险完全不同。' },
  { id: 'c2', text: '共享节点便宜，但多人复用，不适合长期养号。' },
  { id: 'c3', text: '机房 IP 速度快，但数据中心特征明显，跨区运营更容易被识别。' },
  { id: 'c4', text: '静态住宅 IP 独享、可查 ISP，更接近真实家庭宽带，适合指纹环境里长期登录。' },
  { id: 'p1', text: '本期方案：用 LycheeIP 提取静态住宅 IP，再写入 MoreLogin 指纹浏览器。' },
  { id: 'p2', text: 'MoreLogin 为每个账号提供隔离指纹环境；住宅 IP 负责更接近本地用户的网络出口。' },
  { id: 'p3', text: '先说明：LycheeIP 代理产品需在境外网络下使用，请自行准备可用的境外网络。' },
  { id: 'd1', text: '第一步：在 LycheeIP 提取代理 IP。' },
  { id: 'd2', text: '注册并登录 LycheeIP 后台，按引导购买住宅 IP。' },
  { id: 'd3', text: '点击右上角个人头像。' },
  { id: 'd4', text: '进入对应已购代理，再点「已购线路明细」查询。' },
  { id: 'd5', text: '在信息栏记下协议、地址、端口和账号密码。' },
  { id: 'd6', text: '第二步：在 MoreLogin 里配置代理。' },
  { id: 'd7', text: '打开 MoreLogin，注册并登录账号。' },
  { id: 'd8', text: '点击「新建窗口」。' },
  { id: 'd9', text: '选择「高级创建」，填写环境名称。' },
  { id: 'd10', text: '操作系统和浏览器一般保持默认即可。' },
  { id: 'd11', text: '下拉到代理区域，选择你购买的协议类型。' },
  { id: 'd12', text: '把住宅 IP 的地址、端口、账号密码一一填入。' },
  { id: 'd13', text: '填写完成后点击「检查代理」。' },
  { id: 'd14', text: '连接成功后确认保存。' },
  { id: 'd15', text: '在环境列表里可以看到刚创建的窗口。' },
  { id: 'd16', text: '点击「启用」，即可在隔离环境里使用该代理上网。' },
  { id: 's1', text: '记住：账号稳不稳定，从来不只是一个 IP 的问题。' },
  { id: 's2', text: 'IP 只是网络底座；指纹环境、登录频率、资料质量和操作习惯同样关键。' },
  { id: 's3', text: '回顾三步：LycheeIP 提取静态住宅 IP，MoreLogin 高级创建填入，检查通过再启用。' },
  { id: 's4', text: '收藏本期，更多指纹浏览器与住宅 IP 教程见 LycheeIP 帮助中心。' },
];

loadDotEnv(join(profileRoot, '.env'));
loadDotEnv(join(profileRoot, '.env.local'));

const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!elevenKey) {
  console.error('[tts] ELEVENLABS_API_KEY missing');
  process.exit(1);
}

const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || 'WkcRFJo38X9XEP8kGExm';
const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2';
const targetSpeed = Number(process.env.ELEVENLABS_SPEED || 1.35);
const apiSpeed = Math.min(1.2, Math.max(0.7, targetSpeed));
const postTempo = targetSpeed / apiSpeed;
const gapSec = Number(process.env.VOICEOVER_GAP_SEC || 0.12);

mkdirSync(publicDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

console.log(`[tts] beats=${beats.length} voice=${voiceId} speed=${targetSpeed}`);

const partFiles = [];
const timeline = [];
let cursor = 0;

for (let i = 0; i < beats.length; i++) {
  const beat = beats[i];
  const mp3File = join(tmpDir, `${beat.id}.mp3`);
  await synth(beat.text, mp3File, {
    prev: i > 0 ? beats[i - 1].text : undefined,
    next: i < beats.length - 1 ? beats[i + 1].text : undefined,
  });
  if (Math.abs(postTempo - 1) > 0.001) applyTempo(mp3File, postTempo);

  const dur = probeDurationSec(mp3File);
  if (!dur) {
    console.error('probe failed', beat.id);
    process.exit(1);
  }
  timeline.push({ id: beat.id, text: beat.text, startSec: cursor, endSec: cursor + dur, durationSec: dur });
  partFiles.push(mp3File);
  cursor += dur + gapSec;
  console.log(`[tts] ${beat.id}: ${dur.toFixed(2)}s`);
}

const listFile = join(tmpDir, 'concat.txt');
const silenceFile = join(tmpDir, 'silence.mp3');
makeSilence(silenceFile, gapSec);
const lines = [];
for (let i = 0; i < partFiles.length; i++) {
  lines.push(`file '${partFiles[i].replace(/\\/g, '/')}'`);
  if (i < partFiles.length - 1) lines.push(`file '${silenceFile.replace(/\\/g, '/')}'`);
}
writeFileSync(listFile, lines.join('\n'), 'utf8');
concatAudio(listFile, audioPath);

const totalSec = probeDurationSec(audioPath) || cursor;
const meta = {
  audioFile: 'voiceover.mp3',
  totalSec,
  fps: 30,
  totalFrames: Math.ceil(totalSec * 30),
  beats: timeline,
};
writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

const vtt = ['WEBVTT', ''];
for (const b of timeline) {
  vtt.push(`${fmt(b.startSec)} --> ${fmt(b.endSec)}`, b.text, '');
}
writeFileSync(vttPath, vtt.join('\n'), 'utf8');
console.log(`[done] ${totalSec.toFixed(1)}s (${meta.totalFrames} frames)`);

async function synth(text, outFile, { prev, next }) {
  const body = {
    text,
    model_id: modelId,
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.75,
      style: 0.2,
      use_speaker_boost: true,
      speed: apiSpeed,
    },
  };
  if (prev) body.previous_text = prev;
  if (next) body.next_text = next;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

function applyTempo(file, tempo) {
  const tmp = `${file}.t.mp3`;
  const r = spawnSync('ffmpeg', ['-y', '-i', file, '-filter:a', `atempo=${tempo}`, '-q:a', '2', tmp], {
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    console.error(r.stderr);
    process.exit(1);
  }
  writeFileSync(file, readFileSync(tmp));
}

function concatAudio(listFile, outFile) {
  let r = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outFile], {
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    r = spawnSync(
      'ffmpeg',
      ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c:a', 'libmp3lame', '-q:a', '2', outFile],
      { encoding: 'utf8' },
    );
    if (r.status !== 0) {
      console.error(r.stderr);
      process.exit(1);
    }
  }
}

function probeDurationSec(file) {
  const r = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
    { encoding: 'utf8' },
  );
  return r.status === 0 ? parseFloat(r.stdout.trim()) : null;
}

function makeSilence(file, sec) {
  spawnSync(
    'ffmpeg',
    ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(sec), '-q:a', '9', '-acodec', 'libmp3lame', file],
    { encoding: 'utf8' },
  );
}

function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}
