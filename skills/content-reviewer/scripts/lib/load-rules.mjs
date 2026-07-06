import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = join(__dirname, '../../rules');

const PLATFORM_ALIASES = {
  xhs: 'xiaohongshu',
  小红书: 'xiaohongshu',
  zhihu: 'zhihu',
  知乎: 'zhihu',
  wechat: 'wechat',
  公众号: 'wechat',
  douyin: 'douyin',
  抖音: 'douyin',
  youtube: 'youtube',
  tiktok: 'tiktok',
  instagram: 'instagram',
  ig: 'instagram',
  facebook: 'facebook',
  fb: 'facebook',
  reddit: 'reddit',
  linkedin: 'linkedin',
  x: 'x',
  twitter: 'x',
};

/**
 * Minimal YAML parser for content-reviewer rule files (no external deps).
 * @param {string} text
 */
export function parseRuleYaml(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const root = { checks: [], forbidden: {} };
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      i += 1;
      continue;
    }

    if (trimmed === 'checks:') {
      i += 1;
      while (i < lines.length) {
        const checkLine = lines[i];
        if (/^\S/.test(checkLine) && !checkLine.trim().startsWith('-')) {
          break;
        }
        if (checkLine.trim().startsWith('- id:')) {
          const check = { id: checkLine.trim().replace(/^- id:\s*/, '').trim() };
          i += 1;
          while (i < lines.length && /^\s{4}\S/.test(lines[i])) {
            const inner = lines[i].trim();
            const colon = inner.indexOf(':');
            if (colon === -1) {
              i += 1;
              continue;
            }
            const key = inner.slice(0, colon).trim();
            const rawVal = inner.slice(colon + 1).trim();
            if (key === 'params' && rawVal.startsWith('{')) {
              check.params = parseInlineObject(rawVal);
            } else if (key === 'prompt') {
              check.prompt = rawVal;
            } else if (rawVal === 'true' || rawVal === 'false') {
              check[key] = rawVal === 'true';
            } else if (/^\d+$/.test(rawVal)) {
              check[key] = Number(rawVal);
            } else {
              check[key] = stripQuotes(rawVal);
            }
            i += 1;
          }
          root.checks.push(check);
          continue;
        }
        i += 1;
      }
      continue;
    }

    if (trimmed === 'forbidden:') {
      i += 1;
      while (i < lines.length && /^\s{2}\S/.test(lines[i])) {
        const inner = lines[i].trim();
        const colon = inner.indexOf(':');
        if (colon === -1) {
          i += 1;
          continue;
        }
        const key = inner.slice(0, colon).trim();
        const rawVal = inner.slice(colon + 1).trim();
        if (rawVal.startsWith('[')) {
          root.forbidden[key] = parseInlineArray(rawVal);
        } else if (rawVal === 'true' || rawVal === 'false') {
          root.forbidden[key] = rawVal === 'true';
        } else if (rawVal) {
          root.forbidden[key] = stripQuotes(rawVal);
        } else {
          root.forbidden[key] = {};
        }
        i += 1;
      }
      continue;
    }

    const colon = trimmed.indexOf(':');
    if (colon !== -1) {
      const key = trimmed.slice(0, colon).trim();
      const rawVal = trimmed.slice(colon + 1).trim();
      if (rawVal === 'true' || rawVal === 'false') {
        root[key] = rawVal === 'true';
      } else if (/^\d+$/.test(rawVal)) {
        root[key] = Number(rawVal);
      } else if (rawVal) {
        root[key] = stripQuotes(rawVal);
      }
    }
    i += 1;
  }

  return root;
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseInlineObject(s) {
  const inner = s.replace(/^\{|\}$/g, '').trim();
  if (!inner) return {};
  const out = {};
  for (const part of inner.split(',')) {
    const [k, ...rest] = part.split(':');
    if (!k || !rest.length) continue;
    const val = rest.join(':').trim();
    if (val.startsWith('[')) {
      out[k.trim()] = parseInlineArray(val);
    } else if (/^\d+$/.test(val)) {
      out[k.trim()] = Number(val);
    } else {
      out[k.trim()] = stripQuotes(val);
    }
  }
  return out;
}

function parseInlineArray(s) {
  const inner = s.replace(/^\[|\]$/g, '').trim();
  if (!inner) return [];
  return inner.split(',').map((item) => stripQuotes(item.trim()));
}

/**
 * @param {string} platform
 */
export function normalizePlatform(platform) {
  const key = String(platform || '').trim().toLowerCase();
  return PLATFORM_ALIASES[key] ?? key;
}

/**
 * 按内容载体筛选检查项；未指定 carrier 时仅跑 primary 或无 carrier 的项。
 * @param {object[]} checks
 * @param {string} [carrier]
 */
export function filterChecksByCarrier(checks, carrier) {
  if (carrier) {
    return checks.filter((c) => !c.carrier || c.carrier === carrier);
  }
  return checks.filter((c) => c.primary === true || !c.carrier);
}

/**
 * @param {string} platform
 * @param {{ carrier?: string }} [opts]
 */
export function loadPlatformRules(platform, opts = {}) {
  const normalized = normalizePlatform(platform);
  const commonPath = join(RULES_DIR, '_common.yaml');
  const platformPath = join(RULES_DIR, `${normalized}.yaml`);

  if (!existsSync(platformPath)) {
    throw new Error(`未知平台或未找到规则文件: ${platform} (${platformPath})`);
  }

  const common = parseRuleYaml(readFileSync(commonPath, 'utf8'));
  const platformRules = parseRuleYaml(readFileSync(platformPath, 'utf8'));

  const merged = [
    ...common.checks.map((c) => ({ ...c, source: '_common' })),
    ...platformRules.checks.map((c) => ({ ...c, source: normalized })),
  ];

  const checks = filterChecksByCarrier(merged, opts.carrier);

  return {
    platform: normalized,
    display_name: platformRules.display_name ?? normalized,
    forbidden: { ...common.forbidden, ...platformRules.forbidden },
    checks,
  };
}

export { RULES_DIR };
