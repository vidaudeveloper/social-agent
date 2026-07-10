/**
 * Normalize TubePilot / manual JSON and compute ER grades for Long-form videos.
 */

/**
 * Parse ISO 8601 duration (PT1H2M3S) to seconds.
 * @param {string} duration
 * @returns {number}
 */
export function parseIsoDuration(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!m) return 0;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function toInt(value) {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {Record<string, unknown>} item
 * @returns {Record<string, unknown> | null}
 */
export function normalizeVideoItem(item) {
  if (!item || typeof item !== 'object') return null;

  const videoId =
    item.videoId ||
    item.id ||
    item.video_id ||
    (typeof item.url === 'string' && item.url.match(/[?&]v=([^&]+)/)?.[1]) ||
    null;

  if (!videoId) return null;

  const durationSec =
    toInt(item.durationSec ?? item.durationSeconds) ||
    parseIsoDuration(String(item.duration || item.contentDetails?.duration || ''));

  const viewCount = toInt(item.viewCount ?? item.views ?? item.statistics?.viewCount);
  const likeCount = toInt(item.likeCount ?? item.likes ?? item.statistics?.likeCount);
  const commentCount = toInt(item.commentCount ?? item.comments ?? item.statistics?.commentCount);

  const publishedAt = String(
    item.publishedAt || item.published_at || item.snippet?.publishedAt || '',
  );

  const title = String(item.title || item.snippet?.title || '');
  const channelTitle = String(
    item.channelTitle || item.channel || item.channel_title || item.snippet?.channelTitle || '',
  );

  return {
    videoId: String(videoId),
    title,
    channelTitle,
    publishedAt,
    durationSec,
    viewCount,
    likeCount,
    commentCount,
    subscriberCount: toInt(item.subscriberCount ?? item.subscribers),
    url: item.url || `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * @param {Record<string, unknown>} video
 * @returns {{ er: number, viewVelocity: number, normalizedEr: number, grade: string }}
 */
export function computeEngagement(video) {
  const views = Math.max(toInt(video.viewCount), 1);
  const likes = toInt(video.likeCount);
  const comments = toInt(video.commentCount);
  const er = (likes + comments) / views;

  let daysSince = 30;
  if (video.publishedAt) {
    const published = new Date(String(video.publishedAt));
    if (!Number.isNaN(published.getTime())) {
      daysSince = Math.max(1, (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const viewVelocity = toInt(video.viewCount) / daysSince;
  const subs = Math.max(toInt(video.subscriberCount), 1000);
  const normalizedEr = er / Math.log10(subs);

  let grade = 'C';
  if (er >= 0.04 && daysSince <= 30 && views >= 50000) {
    grade = 'S';
  } else if (er >= 0.02) {
    grade = 'A';
  } else if (er >= 0.008) {
    grade = 'B';
  }

  return { er, viewVelocity, normalizedEr, grade, daysSince };
}

/**
 * Map S/A/B/C + metrics to business-readable grade label.
 * @param {string} grade
 * @param {Record<string, unknown>} video
 * @param {{ er: number, viewVelocity: number, daysSince: number }} engagement
 * @returns {string}
 */
export function computeGradeLabel(grade, video, engagement) {
  const views = toInt(video.viewCount);
  const er = engagement.er;
  const velocity = engagement.viewVelocity;

  if (grade === 'S') {
    if (views >= 100_000 && er >= 0.03) return '真爆款·双冠王';
    if (views >= 50_000) return '真爆款';
    return '真爆款·新锐';
  }

  if (grade === 'A') {
    if (views >= 200_000 && er < 0.015) return '流量型·大盘';
    if (views >= 100_000) return '流量型';
    if (velocity >= 5000) return '潜力型·上升';
    return '潜力型';
  }

  if (grade === 'B') {
    if (velocity >= 2000 && engagement.daysSince <= 60) return '潜力型';
    return '观察中';
  }

  return '普通';
}

/**
 * @param {unknown} n
 * @returns {string}
 */
export function formatViews(n) {
  const v = toInt(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>[]}
 */
export function extractVideoList(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];

  const obj = /** @type {Record<string, unknown>} */ (raw);
  const candidates = [
    obj.videos,
    obj.items,
    obj.results,
    obj.data,
    obj.content,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  if (obj.videoId || obj.id) return [obj];
  return [];
}

/**
 * @param {unknown} raw
 * @param {{ minDuration?: number, maxDuration?: number, top?: number }} opts
 */
export function scoreVideos(raw, opts = {}) {
  const minDuration = opts.minDuration ?? 300;
  const maxDuration = opts.maxDuration ?? 1200;
  const top = opts.top ?? 5;

  const list = extractVideoList(raw);
  const scored = [];

  for (const item of list) {
    const normalized = normalizeVideoItem(/** @type {Record<string, unknown>} */ (item));
    if (!normalized) continue;

    const { durationSec } = normalized;
    if (durationSec > 0 && (durationSec < minDuration || durationSec > maxDuration)) {
      continue;
    }

    const engagement = computeEngagement(normalized);
    const gradeLabel = computeGradeLabel(engagement.grade, normalized, engagement);
    scored.push({
      ...normalized,
      ...engagement,
      gradeLabel,
      erPct: Number((engagement.er * 100).toFixed(2)),
      erFormatted: `${(engagement.er * 100).toFixed(2)}%`,
    });
  }

  const gradeOrder = { S: 0, A: 1, B: 2, C: 3 };
  scored.sort((a, b) => {
    const ga = gradeOrder[/** @type {keyof typeof gradeOrder} */ (a.grade)] ?? 9;
    const gb = gradeOrder[/** @type {keyof typeof gradeOrder} */ (b.grade)] ?? 9;
    if (ga !== gb) return ga - gb;
    return /** @type {number} */ (b.viewVelocity) - /** @type {number} */ (a.viewVelocity);
  });

  return scored.slice(0, top);
}
