#!/usr/bin/env node
/**
 * Douyin Skills CLI — 黑底花字竖版视频 + Edge TTS
 */
import { cmdCreateVideo } from './commands/create-video.mjs';
import { cmdListVoices } from './commands/list-voices.mjs';

const USAGE = `Douyin Skills CLI

Commands:
  create-video    TTS + fancy text vertical MP4 (1080x1920)
  list-voices     列出中外男/女声预设（Edge TTS）

Options (create-video):
  --file, -f <path>   Script markdown absolute path
  --slug, -s <slug>   Slug under HERMES_ROOT/文章/抖音/
  --out, -o <dir>     Output directory
  --voice, -v <id>    音色预设或 voice 名（见 list-voices）

Env:
  HERMES_ROOT         Default ./content
  USER_PROFILE_PATH   user-profile.md path
  DOUYIN_TTS_VOICE    覆盖 TTS 音色
  DOUYIN_TTS_RATE     覆盖 TTS 语速（如 +50%）
`;

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const handlers = {
  'create-video': () => cmdCreateVideo(rest),
  'list-voices': () => cmdListVoices(),
};

const handler = handlers[command];
if (!handler) {
  console.error(`Unknown command: ${command}\n`);
  console.log(USAGE);
  process.exit(1);
}

await handler();
