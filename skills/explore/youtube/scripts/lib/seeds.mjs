/**
 * P0 免 API：从运营种子 seeds.json 生成 raw.json（硬指标一律 yt-dlp）。
 *
 * seeds.json 示例：
 * [
 *   { "type": "video", "url": "https://youtu.be/xxxx", "category": "爆款样本" },
 *   { "type": "video", "id": "dQw4w9WgXcQ", "category": "样本" },
 *   { "type": "channel", "id": "UCxxxx", "category": "AI工具" }
 * ]
 */
import { spawnSync } from 'child_process';
import { fetchVideoDetails } from './discover-ytdlp.mjs';

/**
 * @param {string} urlOrId
 * @returns {string | null}
 */
export function extractVideoId(urlOrId) {
  const s = String(urlOrId || '').trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/\/shorts\/([\w-]{11})/) ||
    s.match(/\/embed\/([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * @param {Record<string, unknown>} src
 * @param {{ category?: string, source?: string }} extra
 */
function detailToVideo(src, extra = {}) {
  const id = String(src.id || src.videoId || '');
  if (!id) return null;
  const durationSec = Number(src.duration || src.durationSec || 0);
  return {
    videoId: id,
    title: src.title || '',
    description: String(src.description || '').slice(0, 2000),
    channelTitle: src.channel || src.uploader || src.channelTitle || '',
    publishedAt: src.upload_date
      ? `${String(src.upload_date).slice(0, 4)}-${String(src.upload_date).slice(4, 6)}-${String(src.upload_date).slice(6, 8)}T00:00:00Z`
      : String(src.publishedAt || ''),
    duration: durationSec
      ? `PT${Math.floor(durationSec / 60)}M${durationSec % 60}S`
      : String(src.duration || ''),
    durationSec,
    viewCount: src.view_count ?? src.viewCount ?? 0,
    likeCount: src.like_count ?? src.likeCount ?? 0,
    commentCount: src.comment_count ?? src.commentCount ?? 0,
    url: src.webpage_url || src.url || `https://www.youtube.com/watch?v=${id}`,
    category: extra.category || '',
    source: extra.source || 'yt-dlp-seeds',
  };
}

/**
 * @param {string} channelIdOrUrl
 * @param {number} limit
 * @returns {string[]} video ids
 */
export function listChannelVideoIds(channelIdOrUrl, limit = 15) {
  const raw = String(channelIdOrUrl || '').trim();
  let url = raw;
  if (/^UC[\w-]{20,}$/.test(raw)) {
    url = `https://www.youtube.com/channel/${raw}/videos`;
  } else if (!/^https?:/i.test(raw)) {
    url = `https://www.youtube.com/@${raw.replace(/^@/, '')}/videos`;
  } else if (!/\/videos\/?$/.test(url)) {
    url = url.replace(/\/$/, '') + '/videos';
  }

  const r = spawnSync(
    'uv',
    [
      'run',
      'yt-dlp',
      url,
      '--flat-playlist',
      '-j',
      '--playlist-end',
      String(limit),
    ],
    { encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 },
  );

  if (r.status !== 0) {
    throw new Error(r.stderr || r.stdout || `yt-dlp channel list failed: ${url}`);
  }

  const ids = [];
  for (const line of r.stdout.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const row = JSON.parse(t);
      const id = String(row.id || '');
      if (id) ids.push(id);
    } catch {
      // skip
    }
  }
  return ids;
}

/**
 * @param {unknown} seeds
 * @param {{ channelLimit?: number, delayMs?: number }} [opts]
 * @returns {{ keyword: string, discoveredAt: string, source: string, videos: Record<string, unknown>[] }}
 */
export function seedsToRaw(seeds, opts = {}) {
  const channelLimit = opts.channelLimit ?? 15;
  const delayMs = opts.delayMs ?? 1500;
  const list = Array.isArray(seeds) ? seeds : seeds?.seeds || [];

  /** @type {Map<string, Record<string, unknown>>} */
  const byId = new Map();

  for (const seed of list) {
    if (!seed || typeof seed !== 'object') continue;
    const type = String(seed.type || 'video').toLowerCase();
    const category = String(seed.category || '');

    if (type === 'channel') {
      const channelRef = String(seed.id || seed.url || seed.handle || '');
      if (!channelRef) continue;
      const ids = listChannelVideoIds(channelRef, channelLimit);
      for (const id of ids) {
        if (byId.has(id)) continue;
        const detail = fetchVideoDetails(id);
        const video = detailToVideo(detail || { id }, {
          category,
          source: 'yt-dlp-seeds-channel',
        });
        if (video) byId.set(id, video);
      }
      continue;
    }

    // video
    const id = extractVideoId(String(seed.id || seed.url || seed.videoId || ''));
    if (!id || byId.has(id)) continue;
    const detail = fetchVideoDetails(id);
    const video = detailToVideo(detail || { id, title: seed.title || '' }, {
      category,
      source: 'yt-dlp-seeds',
    });
    if (video) byId.set(id, video);
  }

  void delayMs;

  return {
    keyword: 'seeds',
    discoveredAt: new Date().toISOString(),
    source: 'seeds-ytdlp',
    videos: [...byId.values()],
  };
}

/**
 * 用 yt-dlp 补齐 raw/ranked 条目的硬指标（view/like/duration）。
 * @param {Record<string, unknown>[]} videos
 * @param {{ delayMs?: number }} [opts]
 */
export function enrichVideosWithYtdlp(videos, opts = {}) {
  const delayMs = opts.delayMs ?? 1500;
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const id = String(v.videoId || v.id || extractVideoId(String(v.url || '')) || '');
    if (!id) continue;
    const detail = fetchVideoDetails(id);
    if (!detail) continue;
    const filled = detailToVideo(detail, {
      category: String(v.category || ''),
      source: String(v.source || 'yt-dlp-enrich'),
    });
    if (!filled) continue;
    Object.assign(v, {
      videoId: filled.videoId,
      title: filled.title || v.title,
      description: filled.description || v.description,
      channelTitle: filled.channelTitle || v.channelTitle,
      publishedAt: filled.publishedAt || v.publishedAt,
      duration: filled.duration || v.duration,
      durationSec: filled.durationSec || v.durationSec,
      viewCount: filled.viewCount,
      likeCount: filled.likeCount,
      commentCount: filled.commentCount,
      url: filled.url || v.url,
    });
  }
  void delayMs;
  return videos;
}
