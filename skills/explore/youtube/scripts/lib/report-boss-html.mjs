import { readFileSync, writeFileSync } from 'fs';
import { formatBeijingTime } from './paths.mjs';

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {unknown} n
 */
function formatNum(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

/**
 * @param {Record<string, unknown>} entry
 * @returns {string}
 */
function gradeClass(entry) {
  const g = String(entry.grade || entry.gradeLabel || 'C');
  if (g.includes('真爆款') || g.startsWith('S')) return 's';
  if (g.includes('流量') || g.startsWith('A')) return 'a';
  if (g.includes('潜力') || g.startsWith('B')) return 'b';
  return 'c';
}

/**
 * @param {Record<string, unknown>} entry
 * @param {number} idx
 */
function renderDeepDive(entry, idx) {
  const structure = /** @type {{ hook?: string, body?: string, cta?: string }} */ (
    entry.structure || {}
  );
  const sentences = Array.isArray(entry.sentences) ? entry.sentences : [];
  const deep = /** @type {Record<string, unknown>} */ (entry.deep_dive || {});
  const phrases = Array.isArray(entry.golden_phrases) ? entry.golden_phrases : [];

  const viralPoints = Array.isArray(deep.viral_points)
    ? deep.viral_points
    : [
        structure.hook ? `强钩子：${structure.hook.slice(0, 80)}…` : '开场 3 秒抛出对比/悬念',
        entry.er ? `互动率 ${entry.er}，高于赛道均值` : '互动数据待补充',
        `时长 ${entry.dur}s，符合 Long-form 节奏`,
      ];

  const replicability =
    String(deep.replicability || '') ||
    '可复刻：保留「对比/悬念钩子 + 分步演示 + 明确结论」三段式；需替换为自家产品素材。';

  const owners = Array.isArray(deep.suggested_owners)
    ? deep.suggested_owners
    : ['内容策划', '剪辑'];

  const template =
    String(deep.template_outline || '') ||
    '钩子(0-15s) → 问题/setup → 演示/对比 → 结论/CTA';

  const visualNote =
    String(deep.visual_style_note || '') ||
    '基于标题推断：口播 + B-roll 演示为主；建议对照原视频缩略图确认色调与构图。';

  const scriptList = sentences
    .map(
      (s) =>
        `<li><code>[${escapeHtml(String(s.start))} - ${escapeHtml(String(s.end))}]</code> ${escapeHtml(String(s.text))}</li>`,
    )
    .join('');

  return `
  <section class="deep-dive" id="top1">
    <div class="deep-header">
      <span class="rank">#${idx + 1}</span>
      <span class="grade grade-${gradeClass(entry)}">${escapeHtml(String(entry.grade))}</span>
      <h2>最爆一条深拆：${escapeHtml(String(entry.title))}</h2>
    </div>
    <div class="deep-meta">
      <span>频道：${escapeHtml(String(entry.channel))}</span>
      <span>播放：${escapeHtml(String(entry.views))}</span>
      <span>ER：${escapeHtml(String(entry.er))}</span>
      <span>时长：${Math.round(Number(entry.dur || 0) / 60)} min</span>
    </div>
    ${entry.url ? `<p><a class="link" href="${escapeHtml(String(entry.url))}" target="_blank">打开原视频 →</a></p>` : ''}

    <h3>结构拆解</h3>
    <div class="structure-grid">
      <div><strong>钩子</strong><p>${escapeHtml(structure.hook || '—')}</p></div>
      <div><strong>正文</strong><p>${escapeHtml((structure.body || '—').slice(0, 400))}${(structure.body || '').length > 400 ? '…' : ''}</p></div>
      <div><strong>结尾</strong><p>${escapeHtml(structure.cta || '—')}</p></div>
    </div>

    <h3>画面与风格</h3>
    <p class="note-box">${escapeHtml(visualNote)}</p>

    <h3>爆点总结</h3>
    <ul class="bullet">${viralPoints.map((p) => `<li>${escapeHtml(String(p))}</li>`).join('')}</ul>

    <h3>能否复刻</h3>
    <p>${escapeHtml(replicability)}</p>

    <table class="owner-table">
      <thead><tr><th>角色</th><th>建议</th></tr></thead>
      <tbody>
        ${owners.map((o) => `<tr><td>${escapeHtml(String(o))}</td><td>对照模板执行拍摄与剪辑</td></tr>`).join('')}
      </tbody>
    </table>

    <h3>可复刻模板</h3>
    <pre class="template">${escapeHtml(template)}</pre>

    ${
      scriptList
        ? `<details>
      <summary>按句脚本（${sentences.length} 句）</summary>
      <ol class="script-list">${scriptList}</ol>
    </details>`
        : '<p class="muted">字幕未拉取，见视频简介或稍后重试 extract。</p>'
    }

    ${
      phrases.length
        ? `<h3>金句精选</h3><ul class="phrases">${phrases.map((p) => `<li>${escapeHtml(String(p))}</li>`).join('')}</ul>`
        : ''
    }
  </section>`;
}

/**
 * @param {Record<string, unknown>} entry
 * @param {number} idx
 */
function renderFoldCard(entry, idx) {
  const structure = /** @type {{ hook?: string, body?: string, cta?: string }} */ (
    entry.structure || {}
  );
  return `
  <details class="fold-card">
    <summary>
      <span class="rank-sm">#${idx + 1}</span>
      <span class="grade grade-${gradeClass(entry)}">${escapeHtml(String(entry.grade))}</span>
      ${escapeHtml(String(entry.title))}
      <span class="muted-sm">${escapeHtml(String(entry.views))} · ER ${escapeHtml(String(entry.er))}</span>
    </summary>
    <div class="fold-body">
      <p><strong>钩子：</strong>${escapeHtml((structure.hook || '—').slice(0, 200))}</p>
      <p><strong>正文摘要：</strong>${escapeHtml((structure.body || '—').slice(0, 200))}…</p>
      <a class="link" href="${escapeHtml(String(entry.url))}" target="_blank">原视频 →</a>
    </div>
  </details>`;
}

/**
 * @param {{ topic: string, product: string, slug: string, dataSource?: string }} meta
 * @param {Record<string, unknown>[]} scriptsRaw
 * @param {string} outPath
 */
export function writeBossReportV2(meta, scriptsRaw, outPath) {
  const title = `${meta.topic} 爆款分析报告`;
  const labels = scriptsRaw.map((e) => String(e.title).slice(0, 36));
  const views = scriptsRaw.map((e) => {
    const v = String(e.views || '0');
    if (v.endsWith('M')) return parseFloat(v) * 1_000_000;
    if (v.endsWith('K')) return parseFloat(v) * 1_000;
    return Number(v.replace(/,/g, '')) || 0;
  });
  const erValues = scriptsRaw.map((e) => parseFloat(String(e.er).replace('%', '')) || 0);

  const tableRows = scriptsRaw
    .map(
      (e, i) => `<tr>
        <td>${i + 1}</td>
        <td><span class="grade grade-${gradeClass(e)}">${escapeHtml(String(e.grade))}</span></td>
        <td>${escapeHtml(String(e.title))}</td>
        <td>${escapeHtml(String(e.views))}</td>
        <td>${escapeHtml(String(e.er))}</td>
        <td>${Math.round(Number(e.dur || 0) / 60)}m</td>
        <td>${escapeHtml(String(e.channel))}</td>
      </tr>`,
    )
    .join('');

  const top1 = scriptsRaw[0] ? renderDeepDive(scriptsRaw[0], 0) : '';
  const restCards = scriptsRaw.slice(1).map((e, i) => renderFoldCard(e, i + 1)).join('');

  const allPhrases = scriptsRaw.flatMap((e) =>
    (Array.isArray(e.golden_phrases) ? e.golden_phrases : []).map((p) => ({
      phrase: String(p),
      title: String(e.title),
    })),
  );
  const phraseBlock =
    allPhrases.length > 0
      ? `<section class="phrases-section"><h2>本话题金句精选</h2><ul>${allPhrases
          .slice(0, 15)
          .map(
            (p) =>
              `<li>${escapeHtml(p.phrase)} <span class="muted-sm">— ${escapeHtml(p.title)}</span></li>`,
          )
          .join('')}</ul></section>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root { --bg:#0f1419; --card:#1a2332; --text:#e7ecf3; --muted:#8b9bb4; --accent:#3b82f6; --s:#22c55e; --a:#60a5fa; --b:#fbbf24; --c:#94a3b8; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "Segoe UI", system-ui, sans-serif; background:var(--bg); color:var(--text); line-height:1.55; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
    h1 { font-size: 1.75rem; margin: 0 0 8px; }
    .sub { color: var(--muted); margin-bottom: 28px; font-size: 0.95rem; }
    .chart-box { background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .chart-box h2 { font-size: 1rem; margin: 0 0 12px; color: var(--muted); }
    table { width:100%; border-collapse: collapse; background: var(--card); border-radius: 12px; overflow: hidden; margin-bottom: 32px; }
    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #2a3548; font-size: 0.9rem; }
    th { background: #243044; color: var(--muted); font-weight: 600; }
    .grade { display:inline-block; padding:2px 8px; border-radius:6px; font-weight:700; font-size:0.75rem; }
    .grade-s { background: rgba(34,197,94,.2); color: var(--s); }
    .grade-a { background: rgba(96,165,250,.2); color: var(--a); }
    .grade-b { background: rgba(251,191,36,.2); color: var(--b); }
    .grade-c { background: rgba(148,163,184,.2); color: var(--c); }
    .deep-dive { background: linear-gradient(135deg, #1a2332 0%, #243044 100%); border: 1px solid #3b82f6; border-radius: 14px; padding: 24px; margin-bottom: 28px; }
    .deep-header { display:flex; flex-wrap:wrap; align-items:flex-start; gap:10px; margin-bottom:12px; }
    .deep-header h2 { margin:0; flex:1; font-size:1.15rem; min-width:200px; }
    .rank { background: var(--accent); color:#fff; font-weight:700; padding:4px 10px; border-radius:8px; }
    .rank-sm { background:#243044; padding:2px 8px; border-radius:6px; font-size:0.8rem; margin-right:6px; }
    .deep-meta { display:flex; flex-wrap:wrap; gap:16px; color:var(--muted); font-size:0.9rem; margin-bottom:16px; }
    .structure-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin:12px 0 20px; }
    .structure-grid div { background:#243044; border-radius:8px; padding:12px; }
    .structure-grid strong { display:block; color:var(--accent); margin-bottom:6px; font-size:0.85rem; }
    .structure-grid p { margin:0; font-size:0.88rem; }
    .note-box { background:#243044; padding:12px; border-radius:8px; }
    .owner-table { width:100%; margin:12px 0; }
    .template { background:#0f1419; padding:14px; border-radius:8px; overflow-x:auto; font-size:0.9rem; }
    .fold-card { background:var(--card); border-radius:10px; padding:12px 16px; margin-bottom:10px; }
    .fold-card summary { cursor:pointer; list-style:none; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .fold-body { padding:12px 0 4px; font-size:0.9rem; }
    .muted, .muted-sm { color:var(--muted); }
    .muted-sm { font-size:0.8rem; }
    .link { color: var(--accent); }
    .phrases-section ul, .bullet { padding-left:20px; }
    .script-list { margin:12px 0; padding-left:20px; }
    .script-list li { margin-bottom:8px; font-size:0.9rem; }
    details summary { cursor:pointer; color:var(--accent); margin:12px 0; }
    @media (max-width: 800px) { .structure-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">
      产品：${escapeHtml(meta.product)} · 生成时间：${formatBeijingTime()}（北京时间） · Top ${scriptsRaw.length}
      ${meta.dataSource ? ` · 数据源：${escapeHtml(meta.dataSource)}` : ''}
    </p>

    <div class="chart-box">
      <h2>爆款排行榜（播放量 · 横向）</h2>
      <canvas id="rankChart" height="${Math.max(200, scriptsRaw.length * 36)}"></canvas>
    </div>

    <h2 style="margin-bottom:12px;">排行榜总览</h2>
    <table>
      <thead><tr><th>#</th><th>等级</th><th>标题</th><th>播放</th><th>ER%</th><th>时长</th><th>频道</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    ${top1}

    <h2 style="margin-bottom:12px;">其余 Top 视频</h2>
    ${restCards || '<p class="muted">无更多视频</p>'}

    ${phraseBlock}
  </div>
  <script>
    const labels = ${JSON.stringify(labels)};
    const views = ${JSON.stringify(views)};
    const erPct = ${JSON.stringify(erValues)};
    new Chart(document.getElementById('rankChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: '播放量', data: views, backgroundColor: '#3b82f6', xAxisID: 'x' },
          { label: 'ER%', data: erPct, backgroundColor: '#22c55e', xAxisID: 'x2' }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { labels: { color: '#8b9bb4' } } },
        scales: {
          x: { position: 'bottom', ticks: { color: '#8b9bb4' }, grid: { color: '#2a3548' } },
          x2: { position: 'top', ticks: { color: '#22c55e' }, grid: { drawOnChartArea: false } },
          y: { ticks: { color: '#e7ecf3', font: { size: 11 } }, grid: { color: '#2a3548' } }
        }
      }
    });
  </script>
</body>
</html>`;

  writeFileSync(outPath, html, 'utf8');
}

/**
 * @param {string} scriptsRawPath
 * @param {string} outPath
 * @param {{ topic?: string, product?: string, slug?: string, dataSource?: string }} [meta]
 */
export function buildReportFromScriptsRaw(scriptsRawPath, outPath, meta = {}) {
  const scriptsRaw = JSON.parse(readFileSync(scriptsRawPath, 'utf8'));
  const topic = meta.topic || scriptsRaw[0]?.topic || 'YouTube';
  const product = meta.product || scriptsRaw[0]?.product || topic;
  writeBossReportV2(
    {
      topic,
      product,
      slug: meta.slug || topic,
      dataSource: meta.dataSource,
    },
    scriptsRaw,
    outPath,
  );
}
