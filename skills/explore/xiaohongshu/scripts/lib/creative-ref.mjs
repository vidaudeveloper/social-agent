import { writeFileSync } from 'fs';
import { formatBeijingTime } from './paths.mjs';

/**
 * 生成下次写稿优先阅读的短 Markdown（编排器用）。
 * @param {{
 *   slug: string,
 *   keyword?: string,
 *   insights: Record<string, unknown>,
 *   outPath: string,
 *   reportHtmlRel?: string,
 * }} opts
 */
export function writeCreativeRefMd(opts) {
  const { slug, keyword = '', insights, outPath, reportHtmlRel = '' } = opts;
  const notes = Array.isArray(insights.notes) ? insights.notes : [];
  const metrics = /** @type {Record<string, unknown>} */ (insights.metrics || {});
  const topTags = Array.isArray(insights.topTags) ? insights.topTags : [];
  const doList = Array.isArray(insights.doList) ? insights.doList : [];
  const dontList = Array.isArray(insights.dontList) ? insights.dontList : [];
  const angles = Array.isArray(insights.contentAngles) ? insights.contentAngles : [];
  const titles = Array.isArray(insights.titlePatterns) ? insights.titlePatterns : [];
  const hooks = Array.isArray(insights.hooks) ? insights.hooks : [];

  const lines = [
    `# 小红书创作参考 · ${slug}`,
    '',
    `> 生成于 ${formatBeijingTime()}（北京时间）  `,
    `> 关键词：${keyword || '（未填）'}  · 样本 ${notes.length} 篇  `,
    reportHtmlRel ? `> 完整报告：\`${reportHtmlRel}\`` : '',
    '',
    '## 下次写稿怎么用',
    '',
    '1. 先读本文件，再决定是否重新拉数。',
    '2. 标题从「标题模板」改写，勿照抄。',
    '3. 标签优先用「热门标签」，正文结构对齐「建议做」。',
    '',
    '## 数据快照',
    '',
    `| 指标 | 值 |`,
    `| --- | --- |`,
    `| 均赞 | ${metrics.avgLiked ?? 0} |`,
    `| 均藏 | ${metrics.avgCollected ?? 0} |`,
    `| 均评 | ${metrics.avgComment ?? 0} |`,
    `| 最高赞 | ${metrics.topLiked ?? 0} |`,
    '',
    '## 推荐内容角度',
    '',
    ...(angles.length ? angles.map((a) => `- ${a}`) : ['- （暂无）']),
    '',
    '## 标题模板（改写后使用）',
    '',
    ...(titles.length ? titles.map((t, i) => `${i + 1}. ${t}`) : ['（暂无）']),
    '',
    '## 开头钩子参考',
    '',
    ...(hooks.length ? hooks.map((h, i) => `${i + 1}. ${h}`) : ['（暂无）']),
    '',
    '## 热门标签',
    '',
    topTags.length
      ? topTags.map((t) => `\`${t.tag}\`(${t.count})`).join(' ')
      : '（暂无）',
    '',
    '## 建议做',
    '',
    ...doList.map((x) => `- ${x}`),
    '',
    '## 建议避免',
    '',
    ...dontList.map((x) => `- ${x}`),
    '',
  ];

  if (insights.agentNotes) {
    lines.push('## Agent / 人工补充', '', String(insights.agentNotes), '');
  }

  lines.push('## Top 笔记速览', '');
  for (const [i, n] of notes.slice(0, 5).entries()) {
    lines.push(
      `### #${i + 1} ${n.title || '无标题'}`,
      '',
      `- 作者：${n.author || '—'} · 赞 ${n.likedCount ?? 0} / 藏 ${n.collectedCount ?? 0} / 评 ${n.commentCount ?? 0}`,
      `- 钩子：${n.structure?.hook || '—'}`,
      `- 标签：${(n.tags || []).slice(0, 8).join(' ') || '—'}`,
      '',
    );
  }

  writeFileSync(outPath, lines.filter((l) => l !== undefined).join('\n'), 'utf8');
}
