import { parseCount, splitStructure } from './normalize.mjs';

/**
 * 从详情列表生成可被下次创作读取的 insights（可被 Agent 手写覆盖）。
 * @param {Record<string, unknown>[]} details
 * @param {{ topic?: string, keyword?: string }} [meta]
 * @returns {Record<string, unknown>}
 */
export function buildInsights(details, meta = {}) {
  const notes = (details || []).map((d) => {
    const structure = splitStructure(String(d.text || d.body || d.desc || ''));
    return {
      noteId: d.noteId,
      title: d.title,
      author: d.author,
      likedCount: d.likedCount,
      collectedCount: d.collectedCount,
      commentCount: d.commentCount,
      sharedCount: d.sharedCount,
      tags: d.tags || [],
      imageCount: d.imageCount || 0,
      structure,
      engagementScore:
        Number(d.likedCount || 0) +
        Number(d.collectedCount || 0) * 2 +
        Number(d.commentCount || 0) * 3,
    };
  });

  notes.sort((a, b) => b.engagementScore - a.engagementScore);

  const tagFreq = new Map();
  for (const n of notes) {
    for (const t of n.tags || []) {
      const key = String(t).replace(/^#/, '');
      if (!key) continue;
      tagFreq.set(key, (tagFreq.get(key) || 0) + 1);
    }
  }
  const topTags = [...tagFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

  const titlePatterns = notes
    .slice(0, 5)
    .map((n) => String(n.title || ''))
    .filter(Boolean);

  const hooks = notes
    .slice(0, 5)
    .map((n) => n.structure?.hook)
    .filter(Boolean);

  const avg = (key) =>
    notes.length
      ? Math.round(notes.reduce((s, n) => s + Number(n[key] || 0), 0) / notes.length)
      : 0;

  return {
    version: 1,
    topic: meta.topic || '',
    keyword: meta.keyword || '',
    sampleSize: notes.length,
    metrics: {
      avgLiked: avg('likedCount'),
      avgCollected: avg('collectedCount'),
      avgComment: avg('commentCount'),
      topLiked: notes[0] ? Number(notes[0].likedCount || 0) : 0,
    },
    titlePatterns,
    hooks,
    topTags,
    doList: [
      '标题含数字或明确结果预期（省时/避坑/清单）',
      '开头 1–2 行给痛点或结论，再展开步骤',
      '正文分段短句，配 3–6 张信息卡/步骤图',
      `优先复用热门标签：${topTags
        .slice(0, 5)
        .map((t) => t.tag)
        .join('、') || '（待补充）'}`,
    ],
    dontList: [
      '标题空泛、无对象（如「分享一下」「强烈推荐」单独成题）',
      '正文堆砌关键词、无真实场景',
      '封面信息过密导致缩略图不可读',
    ],
    contentAngles: deriveAngles(notes),
    notes,
  };
}

/**
 * @param {Record<string, unknown>[]} notes
 * @returns {string[]}
 */
function deriveAngles(notes) {
  const angles = [];
  if (notes.some((n) => /避坑|别买|踩雷/.test(String(n.title)))) angles.push('避坑清单');
  if (notes.some((n) => /教程|步骤|怎么|如何/.test(String(n.title)))) angles.push('步骤教程');
  if (notes.some((n) => /对比|测评|横评/.test(String(n.title)))) angles.push('对比测评');
  if (notes.some((n) => /\d+|Top|清单|合集/.test(String(n.title)))) angles.push('清单合集');
  if (!angles.length) angles.push('经验分享', '场景痛点', '结果展示');
  return [...new Set(angles)].slice(0, 5);
}

/**
 * 合并手写 insights（Agent 可补充）与自动生成字段。
 * 规则：metrics / notes / topTags / hooks / titlePatterns 永远以本次 details 为准；
 * 仅当 manual.source === 'manual'（save-insights 写入）时覆盖 doList/dontList/contentAngles/agentNotes。
 * @param {Record<string, unknown>} auto
 * @param {Record<string, unknown> | null} manual
 */
export function mergeInsights(auto, manual) {
  if (!manual || typeof manual !== 'object') return auto;
  const isManual = manual.source === 'manual' || Boolean(manual.agentNotes);
  if (!isManual) return { ...auto };

  return {
    ...auto,
    agentNotes: manual.agentNotes || '',
    doList: Array.isArray(manual.doList) && manual.doList.length ? manual.doList : auto.doList,
    dontList:
      Array.isArray(manual.dontList) && manual.dontList.length ? manual.dontList : auto.dontList,
    contentAngles:
      Array.isArray(manual.contentAngles) && manual.contentAngles.length
        ? manual.contentAngles
        : auto.contentAngles,
  };
}

/**
 * @param {unknown} v
 * @returns {number}
 */
export function engagementOf(v) {
  return (
    parseCount(/** @type {any} */ (v)?.likedCount) +
    parseCount(/** @type {any} */ (v)?.collectedCount) * 2 +
    parseCount(/** @type {any} */ (v)?.commentCount) * 3
  );
}
