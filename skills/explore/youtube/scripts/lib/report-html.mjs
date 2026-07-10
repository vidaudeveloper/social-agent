import { readFileSync, writeFileSync } from 'fs';

/**
 * @param {string} title
 * @param {Record<string, unknown>[]} videos
 * @param {Record<string, unknown>[]} transcripts
 * @param {string} outPath
 */
export function writeBossReportHtml(title, videos, transcripts, outPath) {
  const transcriptMap = new Map(transcripts.map((t) => [t.videoId, t]));

  const labels = videos.map((v) => String(v.title).slice(0, 40));
  const views = videos.map((v) => Number(v.viewCount || 0));
  const erPct = videos.map((v) => Number(v.erPct ?? (Number(v.er || 0) * 100).toFixed(2)));

  const videoCards = videos
    .map((v, idx) => {
      const t = transcriptMap.get(v.videoId);
      const sentences = Array.isArray(t?.sentences) ? t.sentences : [];
      const hook = sentences.slice(0, 3).join(' ');
      const preview = sentences.slice(0, 12);
      const descLines = String(v.description || t?.description || '')
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 8);
      const durationMin = Math.round(Number(v.durationSec || 0) / 60);

      return `
      <section class="video-card" id="video-${idx + 1}">
        <div class="card-header">
          <span class="rank">#${idx + 1}</span>
          <span class="grade grade-${String(v.grade).toLowerCase()}">${v.grade}</span>
          <h3>${escapeHtml(String(v.title))}</h3>
        </div>
        <div class="metrics">
          <div><strong>${formatNum(v.viewCount)}</strong><span>播放量</span></div>
          <div><strong>${v.erPct ?? (Number(v.er) * 100).toFixed(2)}%</strong><span>互动率 ER</span></div>
          <div><strong>${durationMin} min</strong><span>时长</span></div>
          <div><strong>${escapeHtml(String(v.channelTitle || ''))}</strong><span>频道</span></div>
        </div>
        <p class="hook"><strong>开场钩子${preview.length ? '' : '（简介摘要）'}：</strong>${escapeHtml(hook || descLines[0] || '—')}</p>
        ${
          preview.length
            ? `<details open>
          <summary>口播脚本（前 12 句）</summary>
          <ol class="script-list">
            ${preview.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
          </ol>
        </details>`
            : `<div class="desc-box">
          <strong>视频简介要点</strong>
          <ul>${descLines.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
          <p class="note">字幕因 YouTube 限流暂未拉取，配置 TubePilot MCP 或稍后重试 extract。</p>
        </div>`
        }
        <a class="link" href="${escapeHtml(String(v.url))}" target="_blank">打开 YouTube 原视频 →</a>
      </section>`;
    })
    .join('\n');

  const tableRows = videos
    .map(
      (v, i) => `<tr>
        <td>${i + 1}</td>
        <td><span class="grade grade-${String(v.grade).toLowerCase()}">${v.grade}</span></td>
        <td>${escapeHtml(String(v.title))}</td>
        <td>${formatNum(v.viewCount)}</td>
        <td>${v.erPct ?? (Number(v.er) * 100).toFixed(2)}%</td>
        <td>${Math.round(Number(v.durationSec || 0) / 60)}m</td>
        <td>${escapeHtml(String(v.channelTitle || ''))}</td>
      </tr>`,
    )
    .join('');

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
    body { margin:0; font-family: "Segoe UI", system-ui, sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
    h1 { font-size: 1.75rem; margin: 0 0 8px; }
    .sub { color: var(--muted); margin-bottom: 28px; }
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .chart-box { background: var(--card); border-radius: 12px; padding: 20px; }
    .chart-box h2 { font-size: 1rem; margin: 0 0 12px; color: var(--muted); }
    table { width:100%; border-collapse: collapse; background: var(--card); border-radius: 12px; overflow: hidden; margin-bottom: 32px; }
    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #2a3548; font-size: 0.9rem; }
    th { background: #243044; color: var(--muted); font-weight: 600; }
    .grade { display:inline-block; padding:2px 8px; border-radius:6px; font-weight:700; font-size:0.75rem; }
    .grade-s { background: rgba(34,197,94,.2); color: var(--s); }
    .grade-a { background: rgba(96,165,250,.2); color: var(--a); }
    .grade-b { background: rgba(251,191,36,.2); color: var(--b); }
    .grade-c { background: rgba(148,163,184,.2); color: var(--c); }
    .video-card { background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .card-header { display:flex; align-items:flex-start; gap:10px; margin-bottom:14px; }
    .rank { background: var(--accent); color:#fff; font-weight:700; padding:4px 10px; border-radius:8px; font-size:0.85rem; }
    .card-header h3 { margin:0; flex:1; font-size:1.05rem; }
    .metrics { display:grid; grid-template-columns: repeat(4,1fr); gap:12px; margin-bottom:14px; }
    .metrics div { background:#243044; border-radius:8px; padding:10px; }
    .metrics strong { display:block; font-size:1rem; }
    .metrics span { font-size:0.75rem; color:var(--muted); }
    .hook { background:#243044; padding:12px; border-radius:8px; font-size:0.9rem; }
    .desc-box { background:#243044; padding:14px; border-radius:8px; font-size:0.9rem; }
    .desc-box ul { margin:8px 0 0; padding-left:18px; }
    .note { color: var(--muted); font-size:0.8rem; margin-top:10px; }
    .script-list { margin:12px 0 0; padding-left:20px; }
    .script-list li { margin-bottom:8px; }
    details summary { cursor:pointer; color:var(--accent); margin:12px 0 8px; }
    .link { color: var(--accent); text-decoration:none; font-size:0.9rem; }
    @media (max-width: 800px) { .charts { grid-template-columns: 1fr; } .metrics { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}（北京时间） · Long-form 5–20min · Top ${videos.length}</p>

    <div class="charts">
      <div class="chart-box"><h2>播放量对比</h2><canvas id="viewsChart"></canvas></div>
      <div class="chart-box"><h2>互动率 ER% 对比</h2><canvas id="erChart"></canvas></div>
    </div>

    <h2 style="margin-bottom:12px;">排行榜总览</h2>
    <table>
      <thead><tr><th>#</th><th>等级</th><th>标题</th><th>播放</th><th>ER%</th><th>时长</th><th>频道</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    <h2 style="margin-bottom:12px;">爆款脚本拆解</h2>
    ${videoCards}
  </div>
  <script>
    const labels = ${JSON.stringify(labels)};
    const views = ${JSON.stringify(views)};
    const erPct = ${JSON.stringify(erPct)};
    const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#8b9bb4' } }, x: { ticks: { color: '#8b9bb4', maxRotation: 45 } } } };
    new Chart(document.getElementById('viewsChart'), { type: 'bar', data: { labels, datasets: [{ data: views, backgroundColor: '#3b82f6' }] }, options: chartOpts });
    new Chart(document.getElementById('erChart'), { type: 'bar', data: { labels, datasets: [{ data: erPct, backgroundColor: '#22c55e' }] }, options: chartOpts });
  </script>
</body>
</html>`;

  writeFileSync(outPath, html, 'utf8');
}

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return s
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
 * @param {string} rankedPath
 * @param {string} transcriptDir
 * @param {string} outPath
 */
export function buildReportFromFiles(rankedPath, transcriptDir, outPath) {
  const ranked = JSON.parse(readFileSync(rankedPath, 'utf8'));
  const videos = Array.isArray(ranked.videos) ? ranked.videos : [];
  const transcripts = [];

  for (const v of videos) {
    try {
      const t = JSON.parse(readFileSync(`${transcriptDir}/${v.videoId}.json`, 'utf8'));
      transcripts.push(t);
    } catch {
      transcripts.push({ videoId: v.videoId, sentences: [] });
    }
  }

  const keyword = ranked.source || 'YouTube 爆款调研';
  writeBossReportHtml(`YouTube 爆款分析报告 · ${keyword}`, videos, transcripts, outPath);
}
