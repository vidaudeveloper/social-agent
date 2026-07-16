/**
 * P1 免 API：InnerTube browse 直连拿热门榜（FEtrending / 区域 / 分类）。
 *
 * 关键澄清：InnerTube 用的是 YouTube 前端「公开写死」的 client key
 * （AIzaSyAO_FJ2SlqU8Q4IZoHfVcm80PaD-ESyTS9Lw），并非个人 API Key —— 零个人 key。
 * 发现列表后统一用 yt-dlp 的 fetchVideoDetails 取精确硬指标（view/like/duration）。
 * 若 InnerTube 直连被限流/变动，则回退 yt-dlp trending feed（本质也是 InnerTube FEtrending）。
 */
import { spawnSync } from 'child_process';
import { fetchVideoDetails } from './discover-ytdlp.mjs';

// YouTube 前端公开 client key（非个人 API Key，可被任意前端请求使用）
const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4IZoHfVcm80PaD-ESyTS9Lw';
const BROWSE_URL = 'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false';

// 已知分类 browseId（追加到 FEtrending 后；如 FEtrending_music）
const CATEGORIES = {
  all: 'FEtrending',
  music: 'FEtrending_music',
  gaming: 'FEtrending_gaming',
  movies: 'FEtrending_movies',
};

/**
 * @param {{ region?: string, lang?: string, category?: string, clientVersion?: string }} opts
 * @returns {Promise<object>}
 */
export async function fetchTrendingBrowse(opts = {}) {
  const region = (opts.region || 'US').toUpperCase();
  const lang = opts.lang || 'en';
  const browseId = CATEGORIES[(opts.category || 'all').toLowerCase()] || 'FEtrending';

  const body = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: opts.clientVersion || '2.20240101.00.00',
        gl: region,
        hl: lang,
        utcOffsetMinutes: 0,
      },
    },
    browseId,
  };

  const res = await fetch(BROWSE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://www.youtube.com',
      'X-Goog-Api-Key': INNERTUBE_KEY,
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': opts.clientVersion || '2.20240101.00.00',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`InnerTube browse HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * 递归收集响应里所有 videoRenderer（无论 YouTube 怎么嵌套）。
 * @param {unknown} node
 * @param {Array<Record<string, unknown>>} out
 */
function collectVideoRenderers(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectVideoRenderers(item, out);
    return;
  }
  const obj = /** @type {Record<string, unknown>} */ (node);
  if (obj.videoRenderer && typeof obj.videoRenderer === 'object') {
    out.push(/** @type {Record<string, unknown>} */ (obj.videoRenderer));
  }
  for (const key of Object.keys(obj)) {
    collectVideoRenderers(obj[key], out);
  }
}

/**
 * "1.2M views" / "120K" → 数字
 * @param {string | undefined} text
 * @returns {number}
 */
function parseShortCount(text) {
  if (!text) return 0;
  const m = String(text).match(/([\d.,]+)\s*([KMB]?)/i);
  if (!m) return Number(String(text).replace(/[^\d]/g, '')) || 0;
  const n = parseFloat(m[1].replace(/,/g, ''));
  const unit = (m[2] || '').toUpperCase();
  const mult = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : 1;
  return Math.round(n * mult);
}

/**
 * "12:34" / "1:02:03" → 秒
 * @param {string | undefined} text
 * @returns {number}
 */
function parseDuration(text) {
  const parts = String(text || '')
    .split(':')
    .map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  let sec = 0;
  for (const p of parts) sec = sec * 60 + p;
  return sec;
}

/**
 * @param {Record<string, unknown>} vr
 * @returns {Record<string, unknown> | null}
 */
function videoRendererToLite(vr) {
  const id = String(vr.videoId || '');
  if (!id) return null;
  const title =
    /** @type {any} */ (vr.title)?.runs?.[0]?.text ||
    /** @type {any} */ (vr.title)?.simpleText ||
    '';
  const channel =
    /** @type {any} */ (vr.ownerText)?.runs?.[0]?.text ||
    /** @type {any} */ (vr.shortBylineText)?.runs?.[0]?.text ||
    '';
  const durationSec = parseDuration(
    /** @type {any} */ (vr.lengthText)?.simpleText,
  );
  const viewCount = parseShortCount(
    /** @type {any} */ (vr.shortViewCountText)?.simpleText ||
      /** @type {any} */ (vr.viewCountText)?.simpleText,
  );
  return {
    videoId: id,
    title,
    channelTitle: channel,
    durationSec,
    viewCountText: viewCount,
    url: `https://www.youtube.com/watch?v=${id}`,
  };
}

/**
 * 回退：yt-dlp trending feed（本质 = InnerTube FEtrending，零 key，且直接给数值 view_count）。
 * @param {string} region
 * @returns {Array<Record<string, unknown>>}
 */
function trendingViaYtdlp(region) {
  const r = spawnSync(
    'uv',
    [
      'run',
      'yt-dlp',
      'https://www.youtube.com/feed/trending',
      '--flat-playlist',
      '-j',
      '--playlist-end',
      '50',
    ],
    { encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 },
  );
  if (r.status !== 0) return [];
  void region;
  const out = [];
  for (const line of r.stdout.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const row = JSON.parse(t);
      out.push({
        videoId: String(row.id || ''),
        title: row.title || '',
        channelTitle: row.channel || row.uploader || '',
        durationSec: Number(row.duration || 0),
        viewCountText: Number(row.view_count || 0),
        url:
          row.webpage_url ||
          (row.id ? `https://www.youtube.com/watch?v=${row.id}` : ''),
      });
    } catch {
      // skip
    }
  }
  return out;
}

/**
 * InnerTube 免 Key 热门发现主入口。
 * @param {{ region?: string, lang?: string, category?: string, enrichLimit?: number }} [opts]
 * @returns {Promise<{ keyword: string, discoveredAt: string, source: string, videos: Record<string, unknown>[] }>}
 */
export async function discoverTrending(opts = {}) {
  const region = (opts.region || 'US').toUpperCase();
  const lang = opts.lang || 'en';
  const category = opts.category || 'all';
  const enrichLimit = opts.enrichLimit ?? 20;

  let lite = [];
  try {
    const data = await fetchTrendingBrowse({ region, lang, category });
    const found = [];
    collectVideoRenderers(data, found);
    lite = found.map(videoRendererToLite).filter(Boolean);
    console.error(
      `[InnerTube] FEtrending(${region}/${category}) 解析到 ${lite.length} 条`,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[InnerTube] browse 直连失败，回退 yt-dlp trending: ${msg}`);
    lite = trendingViaYtdlp(region);
  }

  const videos = [];
  for (const item of lite.slice(0, enrichLimit)) {
    const detail = fetchVideoDetails(String(item.videoId));
    const src = detail || item;
    const id = String(src.id || item.videoId || '');
    if (!id) continue;
    const durationSec = Number(src.duration || item.durationSec || 0);
    videos.push({
      videoId: id,
      title: src.title || item.title || '',
      description: String(src.description || '').slice(0, 2000),
      channelTitle: src.channel || src.uploader || item.channelTitle || '',
      publishedAt: src.upload_date
        ? `${String(src.upload_date).slice(0, 4)}-${String(src.upload_date).slice(4, 6)}-${String(src.upload_date).slice(6, 8)}T00:00:00Z`
        : '',
      duration: `PT${Math.floor(durationSec / 60)}M${durationSec % 60}S`,
      durationSec,
      viewCount: src.view_count ?? item.viewCountText ?? 0,
      likeCount: src.like_count ?? 0,
      commentCount: src.comment_count ?? 0,
      url:
        src.webpage_url ||
        item.url ||
        `https://www.youtube.com/watch?v=${id}`,
      source: 'innertube-trending',
    });
  }

  return {
    keyword: `trending:${region}:${category}`,
    discoveredAt: new Date().toISOString(),
    source: 'innertube-trending',
    videos,
  };
}
