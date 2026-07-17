/**
 * 字幕失败兜底：yt-dlp 拉音频 → faster-whisper / whisper CLI → segments
 * 工作目录默认：$CONTENT_ROOT/知识库/youtube/_whisper/{videoId}
 * （可用 WHISPER_TMP 覆盖根目录）
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { whisperDir } from './paths.mjs';

/**
 * @param {string} videoId
 * @param {string} langHint  e.g. en | zh | zh,zh-Hans,en
 * @returns {{ fullText: string, segments: { text: string, start?: number }[], language: string, source: string } | null}
 */
export function extractTranscriptWhisper(videoId, langHint = 'en') {
  const workDir = whisperDir(videoId);
  mkdirSync(workDir, { recursive: true });

  const audioPath = downloadAudio(videoId, workDir);
  if (!audioPath) return null;

  const lang = pickWhisperLang(langHint);
  const fromFaster = runFasterWhisper(audioPath, workDir, lang);
  if (fromFaster?.segments?.length) {
    const result = {
      ...fromFaster,
      language: lang,
      source: 'faster-whisper',
    };
    persistTranscriptJson(workDir, videoId, result);
    return result;
  }

  const fromCli = runWhisperCli(audioPath, workDir, lang);
  if (fromCli?.segments?.length) {
    const result = {
      ...fromCli,
      language: lang,
      source: 'whisper-cli',
    };
    persistTranscriptJson(workDir, videoId, result);
    return result;
  }

  return null;
}

/**
 * @param {string} workDir
 * @param {string} videoId
 * @param {Record<string, unknown>} result
 */
function persistTranscriptJson(workDir, videoId, result) {
  try {
    writeFileSync(
      join(workDir, 'transcript.json'),
      JSON.stringify(
        {
          videoId,
          language: result.language,
          source: result.source,
          fullText: result.fullText,
          segments: result.segments,
          savedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      'utf8',
    );
  } catch {
    // ignore
  }
}

/**
 * @param {string} langHint
 */
function pickWhisperLang(langHint) {
  const first = String(langHint || 'en')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (first.startsWith('zh')) return 'zh';
  if (first.length >= 2) return first.slice(0, 2);
  return 'en';
}

/**
 * @param {string} videoId
 * @param {string} workDir
 * @returns {string | null} path to audio file
 */
function downloadAudio(videoId, workDir) {
  const existing = readdirSync(workDir).find((f) =>
    /\.(m4a|webm|mp3|wav|opus)$/i.test(f),
  );
  if (existing) return join(workDir, existing);

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const outTpl = join(workDir, 'audio.%(ext)s');
  const r = spawnSync(
    'uv',
    [
      'run',
      'yt-dlp',
      '-f',
      'bestaudio/best',
      '-x',
      '--audio-format',
      'm4a',
      '--audio-quality',
      '0',
      '-o',
      outTpl,
      '--no-playlist',
      url,
    ],
    { encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 },
  );

  if (r.status !== 0) {
    console.error('[whisper] yt-dlp audio failed:', (r.stderr || r.stdout || '').slice(0, 400));
    return null;
  }

  const found = readdirSync(workDir).find((f) =>
    /\.(m4a|webm|mp3|wav|opus)$/i.test(f),
  );
  return found ? join(workDir, found) : null;
}

/**
 * @param {string} audioPath
 * @param {string} workDir
 * @param {string} lang
 */
function runFasterWhisper(audioPath, workDir, lang) {
  const outJson = join(workDir, 'faster-whisper.json');
  const py = `
import json, sys
try:
    from faster_whisper import WhisperModel
except Exception as e:
    print("NO_FASTER_WHISPER", e, file=sys.stderr)
    sys.exit(2)
model = WhisperModel("base", device="cpu", compute_type="int8")
segments, info = model.transcribe(r"""${audioPath.replace(/\\/g, '/')}""", language="${lang}", vad_filter=True)
rows = []
for s in segments:
    rows.append({"start": float(s.start), "text": (s.text or "").strip()})
open(r"""${outJson.replace(/\\/g, '/')}""", "w", encoding="utf-8").write(
    json.dumps({"language": getattr(info, "language", "${lang}"), "segments": rows}, ensure_ascii=False)
)
`;
  const scriptPath = join(workDir, '_fw.py');
  writeFileSync(scriptPath, py, 'utf8');
  const r = spawnSync('uv', ['run', '--with', 'faster-whisper', 'python', scriptPath], {
    encoding: 'utf8',
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
    env: {
      ...process.env,
      TMPDIR: process.env.TEMP || tmpdir(),
      TMP: process.env.TEMP || tmpdir(),
      TEMP: process.env.TEMP || tmpdir(),
    },
  });
  if (r.status !== 0 || !existsSync(outJson)) {
    if (r.stderr) console.error('[whisper] faster-whisper:', String(r.stderr).slice(0, 300));
    return null;
  }
  try {
    const payload = JSON.parse(readFileSync(outJson, 'utf8'));
    const segments = (payload.segments || [])
      .map((s) => ({ text: String(s.text || '').trim(), start: Number(s.start) || 0 }))
      .filter((s) => s.text);
    if (!segments.length) return null;
    return { segments, fullText: segments.map((s) => s.text).join(' ') };
  } catch {
    return null;
  }
}

/**
 * openai-whisper CLI: whisper audio.m4a --model base --language zh --output_format json
 * @param {string} audioPath
 * @param {string} workDir
 * @param {string} lang
 */
function runWhisperCli(audioPath, workDir, lang) {
  const r = spawnSync(
    'whisper',
    [
      audioPath,
      '--model',
      process.env.WHISPER_MODEL || 'base',
      '--language',
      lang,
      '--output_format',
      'json',
      '--output_dir',
      workDir,
    ],
    {
      encoding: 'utf8',
      shell: true,
      maxBuffer: 20 * 1024 * 1024,
      env: {
        ...process.env,
        TMPDIR: process.env.TEMP || tmpdir(),
        TMP: process.env.TEMP || tmpdir(),
        TEMP: process.env.TEMP || tmpdir(),
      },
    },
  );
  if (r.status !== 0) {
    if (r.stderr) console.error('[whisper] cli:', String(r.stderr).slice(0, 300));
    return null;
  }

  const jsonFile = readdirSync(workDir).find(
    (f) => f.endsWith('.json') && !f.startsWith('_') && f !== 'faster-whisper.json',
  );
  if (!jsonFile) return null;
  try {
    const payload = JSON.parse(readFileSync(join(workDir, jsonFile), 'utf8'));
    const segments = (payload.segments || [])
      .map((s) => ({
        text: String(s.text || '').trim(),
        start: Number(s.start) || 0,
      }))
      .filter((s) => s.text);
    if (!segments.length) return null;
    return { segments, fullText: segments.map((s) => s.text).join(' ') };
  } catch {
    return null;
  }
}
