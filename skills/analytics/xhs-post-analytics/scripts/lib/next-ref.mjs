import { writeFileSync } from 'fs';
import { formatBeijingTime } from './paths.mjs';

/**
 * 发布复盘 → 下次写稿短参考
 * @param {{ report: Record<string, unknown>, outPath: string, reportHtmlName?: string }} opts
 */
export function writeNextCreativeRef(opts) {
  const { report, outPath, reportHtmlName = '' } = opts;
  const account = /** @type {Record<string, unknown>} */ (report.account || {});
  const posts = Array.isArray(report.posts) ? report.posts : [];
  const findings = /** @type {Record<string, unknown>} */ (report.findings || {});
  const best = /** @type {Record<string, unknown>} */ (findings.best || {});
  const suggestions = Array.isArray(report.suggestions) ? report.suggestions : [];

  const lines = [
    `# 发布后复盘 · 下次创作参考`,
    '',
    `> 账号：${account.nickname || ''}（${account.redId || ''}）  `,
    `> 生成于 ${formatBeijingTime()}（北京时间）  `,
    reportHtmlName ? `> 完整报告：\`${reportHtmlName}\`` : '',
    '',
    '## 下次写稿怎么用',
    '',
    '1. 优先复用「表现最好」选题结构，勿照抄旧标题。',
    '2. 按优化建议改标题钩子、首图、文末互动引导。',
    '3. 标签补长尾词；冷启动期加密发布频率。',
    '',
    '## 本轮表现最好',
    '',
    best.title
      ? `- **${best.title}**${best.summary ? ` — ${best.summary}` : ''}`
      : '- （暂无）',
    ...(Array.isArray(best.reasons) ? best.reasons.map((r) => `  - ${r}`) : []),
    '',
    '## 待改进',
    '',
    ...(Array.isArray(findings.issues)
      ? findings.issues.map(
          (i) => `- **${i.problem || ''}**：${i.analysis || ''}`,
        )
      : ['- （暂无）']),
    '',
    '## 优化动作清单',
    '',
  ];

  for (const [idx, s] of suggestions.entries()) {
    lines.push(`### ${idx + 1}. ${s.title || '建议'}`);
    if (s.body) lines.push('', String(s.body), '');
    if (Array.isArray(s.items)) {
      for (const it of s.items) {
        if (it.bad || it.good) {
          lines.push(`- ❌ ${it.bad || ''} → ✅ ${it.good || ''}`);
        } else if (it.text) {
          lines.push(`- ${it.text}`);
        }
      }
      lines.push('');
    }
  }

  lines.push('## 近期作品快览', '');
  for (const [i, p] of posts.entries()) {
    lines.push(
      `${i + 1}. ${p.title || '无标题'} · ${p.publishedAt || '—'} · 赞${p.likedCount ?? 0}/藏${p.collectedCount ?? 0}/评${p.commentCount ?? 0}`,
    );
  }
  lines.push('');

  writeFileSync(outPath, lines.filter((l) => l !== undefined).join('\n'), 'utf8');
}
