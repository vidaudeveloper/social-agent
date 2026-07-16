#!/usr/bin/env node
/** Enrich ranked JSON with yt-dlp hard metrics (views/likes/duration) + description. */
import { readFileSync, writeFileSync } from 'fs';
import { enrichVideosWithYtdlp } from './lib/seeds.mjs';

async function main() {
  const rankedPath = process.argv[2];
  if (!rankedPath) {
    console.error('Usage: node enrich-ranked.mjs <ranked.json>');
    process.exit(1);
  }

  const ranked = JSON.parse(readFileSync(rankedPath, 'utf8'));
  const videos = ranked.videos || [];

  console.log(`[enrich] yt-dlp 补硬指标 ${videos.length} 条...`);
  enrichVideosWithYtdlp(videos);
  writeFileSync(rankedPath, JSON.stringify(ranked, null, 2), 'utf8');
  console.log('enriched', rankedPath);
}

main();
