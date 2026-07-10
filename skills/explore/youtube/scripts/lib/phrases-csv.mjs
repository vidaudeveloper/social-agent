import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { phrasesCsvPath } from './paths.mjs';

const CSV_HEADER = '话题,金句,来源标题,来源链接,产品,类型';

/**
 * @param {string} s
 * @returns {string}
 */
function escapeCsv(s) {
  const v = String(s ?? '').replace(/"/g, '""');
  return /[",\n\r]/.test(v) ? `"${v}"` : v;
}

/**
 * @param {string} path
 * @returns {Set<string>}
 */
function loadExistingKeys(path) {
  const keys = new Set();
  if (!existsSync(path)) return keys;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols.length >= 2) keys.add(`${cols[0]}|${cols[1]}`);
  }
  return keys;
}

/**
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  /** @type {string[]} */
  const cols = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQ = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQ = true;
    } else if (c === ',') {
      cols.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  cols.push(cur);
  return cols;
}

/**
 * @param {Record<string, unknown>[]} scriptsRaw
 * @param {string} topic
 * @param {string} product
 * @returns {{ appended: number, path: string }}
 */
export function appendPhrasesFromScriptsRaw(scriptsRaw, topic, product) {
  const path = phrasesCsvPath();
  mkdirSync(path.replace(/[/\\][^/\\]+$/, ''), { recursive: true });

  const keys = loadExistingKeys(path);
  const newLines = [];

  for (const entry of scriptsRaw) {
    if (!entry.ok) continue;
    const title = String(entry.title || '');
    const url = String(entry.url || '');
    const phrases = Array.isArray(entry.golden_phrases) ? entry.golden_phrases : [];
    const structure = /** @type {{ hook?: string, body?: string, cta?: string }} */ (
      entry.structure || {}
    );

    /** @type {{ phrase: string, type: string }[]} */
    const typed = [];
    if (structure.hook) typed.push({ phrase: structure.hook, type: '钩子' });
    if (structure.body) typed.push({ phrase: structure.body.slice(0, 120), type: '正文' });
    if (structure.cta) typed.push({ phrase: structure.cta, type: '结尾' });
    for (const p of phrases) typed.push({ phrase: String(p), type: '金句' });

    for (const { phrase, type } of typed) {
      const text = phrase.trim();
      if (!text) continue;
      const key = `${topic}|${text}`;
      if (keys.has(key)) continue;
      keys.add(key);
      newLines.push(
        [topic, text, title, url, product, type].map(escapeCsv).join(','),
      );
    }
  }

  if (!existsSync(path)) {
    writeFileSync(path, `${CSV_HEADER}\n`, 'utf8');
  }

  if (newLines.length) {
    const existing = readFileSync(path, 'utf8').replace(/\n?$/, '\n');
    writeFileSync(path, existing + newLines.join('\n') + '\n', 'utf8');
  }

  return { appended: newLines.length, path };
}
