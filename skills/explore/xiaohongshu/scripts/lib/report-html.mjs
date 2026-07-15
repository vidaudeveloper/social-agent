import { writeFileSync } from 'fs';
import { formatBeijingTime } from './paths.mjs';

/**
 * @param {string} s
 * @returns {string}
 */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {unknown} n
 * @returns {string}
 */
function formatNum(n) {
  const v = Number(n || 0);
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return String(v);
}

/**
 * @param {{
 *   title: string,
 *   slug: string,
 *   keyword?: string,
 *   insights: Record<string, unknown>,
 *   outPath: string,
 * }} opts
 */
export function writeReportHtml(opts) {
  const { title, slug, keyword = '', insights, outPath } = opts;
  const notes = Array.isArray(insights.notes) ? insights.notes : [];
  const metrics = /** @type {Record<string, unknown>} */ (insights.metrics || {});
  const topTags = Array.isArray(insights.topTags) ? insights.topTags : [];
  const doList = Array.isArray(insights.doList) ? insights.doList : [];
  const dontList = Array.isArray(insights.dontList) ? insights.dontList : [];
  const angles = Array.isArray(insights.contentAngles) ? insights.contentAngles : [];

  const labels = notes.map((n, i) => `${i + 1}.${String(n.title || '').slice(0, 16)}`);
  const likes = notes.map((n) => Number(n.likedCount || 0));
  const collects = notes.map((n) => Number(n.collectedCount || 0));

  const tableRows = notes
    .map(
      (n, i) => `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(String(n.title || ''))}</td>
        <td>${escapeHtml(String(n.author || ''))}</td>
        <td>${formatNum(n.likedCount)}</td>
        <td>${formatNum(n.collectedCount)}</td>
        <td>${formatNum(n.commentCount)}</td>
        <td>${escapeHtml((n.tags || []).slice(0, 4).join(' '))}</td>
      </tr>`,
    )
    .join('\n');

  const cards = notes
    .map((n, i) => {
      const st = n.structure || {};
      return `<section class="card">
        <div class="card-h"><span class="rank">#${i + 1}</span>
          <h3>${escapeHtml(String(n.title || '无标题'))}</h3></div>
        <div class="metrics">
          <div><strong>${formatNum(n.likedCount)}</strong><span>点赞</span></div>
          <div><strong>${formatNum(n.collectedCount)}</strong><span>收藏</span></div>
          <div><strong>${formatNum(n.commentCount)}</strong><span>评论</span></div>
          <div><strong>${n.imageCount || 0}</strong><span>图片数</span></div>
        </div>
        <p><strong>作者：</strong>${escapeHtml(String(n.author || '—'))}</p>
        <p class="hook"><strong>开头钩子：</strong>${escapeHtml(String(st.hook || '—'))}</p>
        <p><strong>正文提要：</strong>${escapeHtml(String(st.bodyPreview || '—'))}</p>
        <p><strong>收尾：</strong>${escapeHtml(String(st.cta || '—'))}</p>
        <p class="tags">${escapeHtml((n.tags || []).map((t) => `#${t}`).join(' '))}</p>
      </section>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root { --bg:#f6f3ee; --card:#fff; --text:#1c1917; --muted:#78716c; --accent:#e11d48; --line:#e7e5e4; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "PingFang SC","Segoe UI",sans-serif; background:linear-gradient(180deg,#faf7f2,#f0ebe3); color:var(--text); line-height:1.55; }
    .wrap { max-width: 1040px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { font-size: 1.7rem; margin: 0 0 6px; }
    .sub { color: var(--muted); margin-bottom: 24px; }
    .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
    .kpi { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; }
    .kpi strong { display:block; font-size:1.35rem; }
    .kpi span { color:var(--muted); font-size:.85rem; }
    .charts { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
    .chart-box, .panel { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:16px; }
    .chart-box h2, .panel h2 { font-size:1rem; margin:0 0 12px; color:var(--muted); }
    table { width:100%; border-collapse:collapse; background:var(--card); border-radius:14px; overflow:hidden; border:1px solid var(--line); margin-bottom:24px; }
    th, td { padding:10px 12px; text-align:left; border-bottom:1px solid var(--line); font-size:.9rem; }
    th { background:#fafaf9; color:var(--muted); }
    .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:14px; }
    .card-h { display:flex; gap:10px; align-items:center; }
    .rank { background:var(--accent); color:#fff; border-radius:8px; padding:2px 8px; font-weight:700; font-size:.8rem; }
    .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:12px 0; }
    .metrics div { background:#fafaf9; border-radius:10px; padding:10px; }
    .metrics strong { display:block; }
    .metrics span { color:var(--muted); font-size:.8rem; }
    .hook { background:#fff1f2; border-radius:10px; padding:10px 12px; }
    .tags { color:var(--accent); }
    ul { margin:0; padding-left:1.2rem; }
    @media (max-width:800px){ .kpis,.charts,.metrics{ grid-template-columns:1fr 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">话题 <code>${escapeHtml(slug)}</code>
      ${keyword ? `· 关键词「${escapeHtml(keyword)}」` : ''}
      · 生成于 ${escapeHtml(formatBeijingTime())}（北京时间）
      · 样本 ${notes.length} 篇</p>

    <div class="kpis">
      <div class="kpi"><strong>${formatNum(metrics.avgLiked)}</strong><span>均赞</span></div>
      <div class="kpi"><strong>${formatNum(metrics.avgCollected)}</strong><span>均藏</span></div>
      <div class="kpi"><strong>${formatNum(metrics.avgComment)}</strong><span>均评</span></div>
      <div class="kpi"><strong>${formatNum(metrics.topLiked)}</strong><span>最高赞</span></div>
    </div>

    <div class="charts">
      <div class="chart-box"><h2>点赞对比</h2><canvas id="likes"></canvas></div>
      <div class="chart-box"><h2>收藏对比</h2><canvas id="collects"></canvas></div>
    </div>

    <div class="panel">
      <h2>创作建议（下次发文必读）</h2>
      <p><strong>推荐角度：</strong>${escapeHtml(angles.join('、') || '—')}</p>
      <p><strong>热门标签：</strong>${escapeHtml(
        topTags.map((t) => `#${t.tag}`).join(' ') || '—',
      )}</p>
      <p><strong>建议做：</strong></p>
      <ul>${doList.map((x) => `<li>${escapeHtml(String(x))}</li>`).join('')}</ul>
      <p><strong>建议避免：</strong></p>
      <ul>${dontList.map((x) => `<li>${escapeHtml(String(x))}</li>`).join('')}</ul>
      ${
        insights.agentNotes
          ? `<p><strong>人工补充：</strong>${escapeHtml(String(insights.agentNotes))}</p>`
          : ''
      }
    </div>

    <table>
      <thead><tr><th>#</th><th>标题</th><th>作者</th><th>赞</th><th>藏</th><th>评</th><th>标签</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    ${cards}
  </div>
  <script>
    const labels = ${JSON.stringify(labels)};
    const likes = ${JSON.stringify(likes)};
    const collects = ${JSON.stringify(collects)};
    const common = { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } };
    new Chart(document.getElementById('likes'), { type:'bar', data:{ labels, datasets:[{ data:likes, backgroundColor:'#fb7185' }] }, options:common });
    new Chart(document.getElementById('collects'), { type:'bar', data:{ labels, datasets:[{ data:collects, backgroundColor:'#f43f5e' }] }, options:common });
  </script>
</body>
</html>`;

  writeFileSync(outPath, html, 'utf8');
}
