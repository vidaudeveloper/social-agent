/**
 * Discover fallback via yt-dlp when TubePilot MCP / API key unavailable.
 */
import { spawnSync } from 'child_process';

/**
 * @param {string} keyword
 * @param {number} maxResults
 * @returns {Record<string, unknown>[]}
 */
export function searchYoutube(keyword, maxResults = 25) {
  const query = `ytsearch${maxResults}:"${keyword.replace(/"/g, '')}"`;
  const r = spawnSync('uv', ['run', 'yt-dlp', query, '--flat-playlist', '-j'], {
    encoding: 'utf8',
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
  });

  if (r.status !== 0) {
    throw new Error(r.stderr || r.stdout || 'yt-dlp search failed');
  }

  const items = [];
  for (const line of r.stdout.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      items.push(JSON.parse(t));
    } catch {
      // skip malformed lines
    }
  }
  return items;
}

/**
 * @param {string} videoId
 * @returns {Record<string, unknown> | null}
 */
export function fetchVideoDetails(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const r = spawnSync(
    'uv',
    ['run', 'yt-dlp', '-j', '--skip-download', url],
    { encoding: 'utf8', shell: true, maxBuffer: 10 * 1024 * 1024 },
  );
  if (r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout.trim());
  } catch {
    return null;
  }
}

/**
 * @param {string} keyword
 * @param {{ minDuration?: number, maxDuration?: number, enrichLimit?: number }} opts
 */
export function discoverToRaw(keyword, opts = {}) {
  const minDuration = opts.minDuration ?? 300;
  const maxDuration = opts.maxDuration ?? 1200;
  const enrichLimit = opts.enrichLimit ?? 12;

  const searchHits = searchYoutube(keyword, 25);
  const candidates = searchHits.filter((v) => {
    const d = Number(v.duration || 0);
    return d >= minDuration && d <= maxDuration;
  });

  const videos = [];
  for (const hit of candidates.slice(0, enrichLimit)) {
    const detail = fetchVideoDetails(String(hit.id));
    const src = detail || hit;
    videos.push({
      videoId: src.id,
      title: src.title,
      description: String(src.description || '').slice(0, 2000),
      channelTitle: src.channel || src.uploader,
      publishedAt: src.upload_date
        ? `${String(src.upload_date).slice(0, 4)}-${String(src.upload_date).slice(4, 6)}-${String(src.upload_date).slice(6, 8)}T00:00:00Z`
        : '',
      duration: `PT${Math.floor(Number(src.duration || 0) / 60)}M${Number(src.duration || 0) % 60}S`,
      durationSec: Number(src.duration || 0),
      viewCount: src.view_count ?? 0,
      likeCount: src.like_count ?? 0,
      commentCount: src.comment_count ?? 0,
      url: src.webpage_url || `https://www.youtube.com/watch?v=${src.id}`,
      source: 'yt-dlp',
    });
  }

  return {
    keyword,
    discoveredAt: new Date().toISOString(),
    source: 'yt-dlp-fallback',
    videos,
  };
}
