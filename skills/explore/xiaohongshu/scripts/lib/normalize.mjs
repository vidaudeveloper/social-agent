/**
 * 把 XHS CLI 的 search / detail JSON 收成统一笔记结构，供报告与 insights 使用。
 */

/**
 * @param {unknown} v
 * @returns {number}
 */
export function parseCount(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  // 去掉 BOM / 空白 / 千分位；兼容「1.2万」「1.2w」
  const s = String(v)
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/,/g, '')
    .replace(/\s+/g, '');
  const wan = s.match(/^([\d.]+)\s*[万萬wW]$/);
  if (wan) return Math.round(Number(wan[1]) * 10000);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {Record<string, unknown>} feed
 * @returns {Record<string, unknown>}
 */
export function normalizeFeedItem(feed) {
  const noteCard = /** @type {Record<string, unknown>} */ (feed.noteCard || feed.note_card || {});
  const interact = /** @type {Record<string, unknown>} */ (
    noteCard.interactInfo || noteCard.interact_info || feed.interactInfo || {}
  );
  const user = /** @type {Record<string, unknown>} */ (noteCard.user || feed.user || {});
  const id = String(feed.id || feed.noteId || noteCard.noteId || '');
  return {
    noteId: id,
    xsecToken: String(feed.xsecToken || feed.xsec_token || ''),
    title: String(noteCard.displayTitle || noteCard.display_title || noteCard.title || feed.title || ''),
    type: String(noteCard.type || feed.type || ''),
    author: String(user.nickname || user.nickName || user.nick_name || ''),
    likedCount: parseCount(interact.likedCount ?? interact.liked_count),
    collectedCount: parseCount(interact.collectedCount ?? interact.collected_count),
    commentCount: parseCount(interact.commentCount ?? interact.comment_count),
    sharedCount: parseCount(interact.sharedCount ?? interact.shared_count),
  };
}

/**
 * @param {Record<string, unknown>} payload
 * @returns {Record<string, unknown>}
 */
export function normalizeDetail(payload) {
  const note = /** @type {Record<string, unknown>} */ (payload.note || payload);
  const interact = /** @type {Record<string, unknown>} */ (note.interactInfo || note.interact_info || {});
  const user = /** @type {Record<string, unknown>} */ (note.user || {});
  const tags = Array.isArray(note.tags)
    ? note.tags.map(String)
    : Array.isArray(note._domTags)
      ? note._domTags.map(String)
      : [];
  const body = String(note.body || note._domBody || '');
  const desc = String(note.desc || '');
  // 兼容：CLI 原始 { interactInfo } 与本 CLI 已规范化顶层字段
  const likedCount = parseCount(
    note.likedCount ?? interact.likedCount ?? interact.liked_count,
  );
  const collectedCount = parseCount(
    note.collectedCount ?? interact.collectedCount ?? interact.collected_count,
  );
  const commentCount = parseCount(
    note.commentCount ?? interact.commentCount ?? interact.comment_count,
  );
  const sharedCount = parseCount(
    note.sharedCount ?? interact.sharedCount ?? interact.shared_count,
  );
  return {
    noteId: String(note.noteId || note.note_id || payload.noteId || ''),
    title: String(note.title || ''),
    desc,
    body,
    text: body || desc,
    tags,
    type: String(note.type || ''),
    author: String(note.author || user.nickname || user.nickName || user.nick_name || ''),
    likedCount,
    collectedCount,
    commentCount,
    sharedCount,
    imageCount:
      Number(note.imageCount) ||
      (Array.isArray(note.imageList || note.image_list)
        ? (note.imageList || note.image_list).length
        : 0),
    comments: Array.isArray(payload.comments) ? payload.comments : [],
  };
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>[]}
 */
export function extractFeedsFromRaw(raw) {
  if (!raw || typeof raw !== 'object') return [];
  const obj = /** @type {Record<string, unknown>} */ (raw);
  const feeds = obj.feeds || obj.data || (Array.isArray(raw) ? raw : null);
  if (!Array.isArray(feeds)) return [];
  return feeds.map((f) => normalizeFeedItem(/** @type {Record<string, unknown>} */ (f)));
}

/**
 * @param {unknown} detailsFile
 * @returns {Record<string, unknown>[]}
 */
export function extractDetailsList(detailsFile) {
  if (!detailsFile) return [];
  if (Array.isArray(detailsFile)) {
    return detailsFile.map((d) => normalizeDetail(/** @type {Record<string, unknown>} */ (d)));
  }
  const obj = /** @type {Record<string, unknown>} */ (detailsFile);
  if (Array.isArray(obj.notes)) {
    return obj.notes.map((d) => normalizeDetail(/** @type {Record<string, unknown>} */ (d)));
  }
  if (obj.note || obj.noteId || obj.title) {
    return [normalizeDetail(obj)];
  }
  return [];
}

/**
 * @param {string} text
 * @returns {{ hook: string, bodyPreview: string, cta: string }}
 */
export function splitStructure(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const hook = lines[0] || String(text || '').slice(0, 40);
  const cta =
    [...lines].reverse().find((l) => /评论|收藏|关注|私信|链接|同款|点击|戳|看看/.test(l)) ||
    lines[lines.length - 1] ||
    '';
  const bodyPreview = lines.slice(1, 6).join(' / ');
  return { hook, bodyPreview, cta };
}
