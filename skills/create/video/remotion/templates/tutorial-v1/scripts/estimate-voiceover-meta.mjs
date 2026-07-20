#!/usr/bin/env node
/**
 * Optional: rebuild voiceover-meta.json from beats.ts text lengths
 * when you do not have TTS yet (timing estimate only).
 *
 * Usage:
 *   node scripts/estimate-voiceover-meta.mjs
 *   node scripts/estimate-voiceover-meta.mjs --cps 4.2 --gap 0.25
 */
import {readFileSync, writeFileSync} from 'fs';
import {dirname, join, resolve} from 'path';
import {fileURLToPath} from 'url';
import {createRequire} from 'module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// Lightweight parse: extract id + text from beats.ts without TS transpile
const beatsSrc = readFileSync(join(root, 'src/data/beats.ts'), 'utf8');
const beatRe = /\{\s*id:\s*'([^']+)'[\s\S]*?text:\s*'((?:\\'|[^'])*)'/g;
const beats = [];
let m;
while ((m = beatRe.exec(beatsSrc))) {
  beats.push({id: m[1], text: m[2].replace(/\\'/g, "'")});
}

if (!beats.length) {
  console.error('no beats parsed from src/data/beats.ts');
  process.exit(1);
}

const args = process.argv.slice(2);
const cpsIdx = args.indexOf('--cps');
const gapIdx = args.indexOf('--gap');
const cps = cpsIdx >= 0 ? Number(args[cpsIdx + 1]) : 4.0;
const gap = gapIdx >= 0 ? Number(args[gapIdx + 1]) : 0.2;
const fps = 30;

let t = 0;
const metaBeats = beats.map((b) => {
  const durationSec = Math.max(1.2, b.text.length / cps);
  const startSec = t;
  const endSec = t + durationSec;
  t = endSec + gap;
  return {
    id: b.id,
    text: b.text,
    startSec: Number(startSec.toFixed(3)),
    endSec: Number(endSec.toFixed(3)),
    durationSec: Number(durationSec.toFixed(3)),
  };
});

const totalSec = Number(t.toFixed(3));
const meta = {
  audioFile: 'voiceover.mp3',
  totalSec,
  fps,
  totalFrames: Math.round(totalSec * fps),
  beats: metaBeats,
};

const out = join(root, 'public/voiceover-meta.json');
writeFileSync(out, JSON.stringify(meta, null, 2) + '\n');
console.log(`wrote ${out} (${beats.length} beats, ${totalSec}s)`);
console.log('replace voiceover.mp3 with real TTS matching these timings');
// silence unused
void require;
