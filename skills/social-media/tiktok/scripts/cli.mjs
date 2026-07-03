#!/usr/bin/env node
/**
 * TikTok Skills CLI — 花字竖版视频 + 英文 Edge TTS（≤90s）
 */
import { cmdCreateVideo } from './commands/create-video.mjs';
import { cmdListVoices } from './commands/list-voices.mjs';

const USAGE = `TikTok Skills CLI

Commands:
  create-video    Fancy text vertical MP4 + English TTS (max ~90s)
  list-voices     英文音色预设

Options (create-video):
  --file, -f <path>   Script markdown absolute path
  --slug, -s <slug>   Slug under HERMES_ROOT/文章/TikTok/
  --out, -o <dir>     Output directory
  --voice, -v <id>    us-male / us-female / en-US-JennyNeural ...

Env:
  HERMES_ROOT              Default D:/test/hermes
  TIKTOK_MAX_DURATION_SEC  Max video length (default 90)
  TIKTOK_TTS_VOICE         Override voice preset
  TIKTOK_TTS_RATE          e.g. +50%
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
