#!/usr/bin/env node
/** Enrich ranked JSON with video descriptions (for boss report when subs blocked). */
import { readFileSync, writeFileSync } from 'fs';
import { fetchVideoDetails } from './lib/discover-ytdlp.mjs';

async function main() {
  const rankedPath = process.argv[2];
  if (!rankedPath) {
    console.error('Usage: node enrich-ranked.mjs <ranked.json>');
    process.exit(1);
  }

  const ranked = JSON.parse(readFileSync(rankedPath, 'utf8'));
  const videos = ranked.videos || [];

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    console.log(`[${i + 1}/${videos.length}] ${v.videoId} ...`);
    const detail = fetchVideoDetails(String(v.videoId));
    if (detail?.description) {
      v.description = String(detail.description).slice(0, 2000);
    }
    if (i < videos.length - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  writeFileSync(rankedPath, JSON.stringify(ranked, null, 2), 'utf8');
  console.log('enriched', rankedPath);
}

main();
