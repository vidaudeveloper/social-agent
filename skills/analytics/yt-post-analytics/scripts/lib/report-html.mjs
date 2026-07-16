import { writeFileSync } from 'fs';
import { formatBeijingTime } from './paths.mjs';

/**
 * @param {string} s
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
 */
function formatNum(n) {
  if (n == null || n === '' || n === '—') return '—';
  const v = Number(n);
  if (!Number.isFinite(v)) return escapeHtml(String(n));
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return String(v);
}

/**
 * @param {unknown} sec
 */
function formatDurationSec(sec) {
  const v = Number(sec);
  if (!Number.isFinite(v)) return '—';
  if (v < 60) return `${v}秒`;
  const m = Math.floor(v / 60);
  const s = v % 60;
  return `${m}分${s}秒`;
}

/**
 * YouTube 发布后作品复盘 HTML
 * @param {{ report: Record<string, unknown>, outPath: string }} opts
 */
export function writeYoutubeReportHtml(opts) {
  const { report, outPath } = opts;
  const channel = /** @type {Record<string, unknown>} */ (report.channel || {});
  const period = /** @type {Record<string, unknown>} */ (report.period || {});
  const days = Array.isArray(report.days) ? report.days : [];
  const videos = Array.isArray(report.videos) ? report.videos : [];
  const summary = /** @type {Record<string, unknown>} */ (report.summary || {});
  const findings = /** @type {Record<string, unknown>} */ (report.findings || {});
  const best = /** @type {Record<string, unknown>} */ (findings.best || {});
  const issues = Array.isArray(findings.issues) ? findings.issues : [];
  const suggestions = Array.isArray(report.suggestions) ? report.suggestions : [];
  const title = String(report.title || 'YouTube 频道作品数据全分析');
  const generatedAt = String(report.generatedAt || formatBeijingTime());
  const dataNote = String(
    report.dataNote ||
      '数据来源：YouTube Data API v3 + YouTube Analytics API v2（Analytics 与公开统计口径可能略有差异）',
  );

  const channelRows = [
    ['频道名', channel.title],
    ['自定义 URL', channel.customUrl],
    ['频道 ID', channel.id],
    ['订阅', channel.subscriberCount],
    ['总播放（公开）', channel.viewCount],
    ['视频数（公开）', channel.videoCount],
    ['创建时间', channel.publishedAt],
  ]
    .filter(([, v]) => v != null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><th>${escapeHtml(String(k))}</th><td>${escapeHtml(String(v))}</td></tr>`,
    )
    .join('\n');

  const summaryCards = [
    ['区间播放', summary.views],
    ['点赞', summary.likes],
    ['评论', summary.comments],
    ['观看分钟', summary.estimatedMinutesWatched],
    ['增粉', summary.subscribersGained],
    ['掉粉', summary.subscribersLost],
  ]
    .map(
      ([k, v]) =>
        `<div class="kpi"><div class="kpi-label">${escapeHtml(String(k))}</div><div class="kpi-value">${formatNum(v)}</div></div>`,
    )
    .join('\n');

  const videoRows = videos
    .map((v, i) => {
      const row = /** @type {Record<string, unknown>} */ (v);
      const url = row.id ? `https://www.youtube.com/watch?v=${row.id}` : '';
      const titleCell = url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(String(row.title || row.id))}</a>`
        : escapeHtml(String(row.title || row.id || ''));
      return `<tr>
        <td>${i + 1}</td>
        <td class="title">${titleCell}</td>
        <td>${escapeHtml(String(row.publishedAt || '—'))}</td>
        <td>${formatNum(row.views)}</td>
        <td>${formatNum(row.likes)}</td>
        <td>${formatNum(row.comments)}</td>
        <td>${formatNum(row.estimatedMinutesWatched)}</td>
        <td>${formatDurationSec(row.averageViewDuration)}</td>
        <td>${row.averageViewPercentage != null ? `${Number(row.averageViewPercentage).toFixed(1)}%` : '—'}</td>
      </tr>`;
    })
    .join('\n');

  const dayLabels = days.map((d) => String(/** @type {any} */ (d).day || ''));
  const dayViews = days.map((d) => Number(/** @type {any} */ (d).views || 0));
  const videoLabels = videos.map((v, i) => {
    const t = String(/** @type {any} */ (v).title || /** @type {any} */ (v).id || '');
    return `${i + 1}.${t.slice(0, 14)}`;
  });
  const videoViews = videos.map((v) => Number(/** @type {any} */ (v).views || 0));

  const dayRows = days
    .filter((d) => Number(/** @type {any} */ (d).views || 0) > 0)
    .map((d) => {
      const row = /** @type {Record<string, unknown>} */ (d);
      return `<tr>
        <td>${escapeHtml(String(row.day || ''))}</td>
        <td>${formatNum(row.views)}</td>
        <td>${formatNum(row.likes)}</td>
        <td>${formatNum(row.comments)}</td>
        <td>${formatNum(row.estimatedMinutesWatched)}</td>
        <td>${formatDurationSec(row.averageViewDuration)}</td>
        <td>${formatNum(row.subscribersGained)}</td>
        <td>${formatNum(row.subscribersLost)}</td>
      </tr>`;
    })
    .join('\n');

  const bestReasons = Array.isArray(best.reasons)
    ? best.reasons.map((r) => `<li>${escapeHtml(String(r))}</li>`).join('')
    : '';

  const issueRows = issues
    .map((it) => {
      const row = /** @type {Record<string, unknown>} */ (it);
      return `<tr><th>${escapeHtml(String(row.problem || ''))}</th><td>${escapeHtml(
        String(row.analysis || ''),
      )}</td></tr>`;
    })
    .join('\n');

  const suggestionBlocks = suggestions
    .map((s, idx) => {
      const block = /** @type {Record<string, unknown>} */ (s);
      const items = Array.isArray(block.items) ? block.items : [];
      const itemHtml = items
        .map((it) => {
          const row = /** @type {Record<string, unknown>} */ (it);
          if (row.bad || row.good) {
            return `<li><span class="bad">❌ ${escapeHtml(String(row.bad || ''))}</span>
              <span class="arrow">→</span>
              <span class="good">✅ ${escapeHtml(String(row.good || ''))}</span></li>`;
          }
          return `<li>${escapeHtml(String(row.text || row))}</li>`;
        })
        .join('');
      const body = block.body ? `<p>${escapeHtml(String(block.body))}</p>` : '';
      return `<div class="suggest-item">
        <h3>${idx + 1}. ${escapeHtml(String(block.title || '建议'))}</h3>
        ${body}
        ${itemHtml ? `<ul class="rewrite">${itemHtml}</ul>` : ''}
      </div>`;
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
    :root {
      --bg: #f4f6f8;
      --card: #fff;
      --text: #1a1d21;
      --muted: #5f6b7a;
      --line: #e2e8f0;
      --accent: #c4302b;
      --soft: #eef2f6;
      --ok: #0f766e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 40%);
      color: var(--text);
      line-height: 1.6;
    }
    .wrap { max-width: 980px; margin: 0 auto; padding: 28px 18px 64px; }
    h1 { font-size: 1.55rem; margin: 0 0 8px; letter-spacing: -0.02em; }
    .sub { color: var(--muted); margin: 0 0 22px; font-size: .92rem; }
    section, .chart-box {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.03);
    }
    section h2, .chart-box h2 {
      margin: 0 0 14px;
      font-size: 1.05rem;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .kpi-label { color: var(--muted); font-size: .8rem; }
    .kpi-value { font-size: 1.25rem; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: .92rem; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-weight: 600; background: var(--soft); }
    .account th, .issues th { width: 28%; }
    .videos td.title a { color: var(--accent); text-decoration: none; font-weight: 600; }
    .videos td.title a:hover { text-decoration: underline; }
    .note { color: var(--muted); font-size: .85rem; margin-top: 10px; }
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .scroll { overflow-x: auto; }
    .best {
      background: #f0faf4;
      border: 1px solid #c6f0d8;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .best strong.hl { color: var(--accent); }
    .suggest-item { margin-bottom: 14px; }
    .suggest-item h3 { margin: 0 0 8px; font-size: .98rem; }
    .rewrite { list-style: none; padding: 0; margin: 0; }
    .rewrite li {
      background: var(--soft);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 8px;
      display: grid;
      gap: 4px;
    }
    .bad { color: #c03639; }
    .good { color: var(--ok); }
    .arrow { color: var(--muted); }
    @media (max-width: 860px) {
      .kpis { grid-template-columns: repeat(3, 1fr); }
      .charts { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .kpis { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>📊 ${escapeHtml(title)}</h1>
    <p class="sub">
      频道「${escapeHtml(String(channel.title || ''))}」 ·
      区间 ${escapeHtml(String(period.startDate || ''))} ~ ${escapeHtml(String(period.endDate || ''))} ·
      生成于 ${escapeHtml(generatedAt)}（北京时间） · 共 ${videos.length} 条作品样本
    </p>

    <div class="kpis">${summaryCards}</div>

    <section>
      <h2>👤 频道概况</h2>
      <table class="account">${channelRows || '<tr><td colspan="2">暂无数据</td></tr>'}</table>
    </section>

    <div class="charts">
      <div class="chart-box"><h2>区间每日播放</h2><canvas id="dayViews" height="160"></canvas></div>
      <div class="chart-box"><h2>分视频播放</h2><canvas id="videoViews" height="160"></canvas></div>
    </div>

    <section>
      <h2>📋 作品数据总览（Analytics）</h2>
      <div class="scroll videos">
        <table>
          <thead>
            <tr>
              <th>#</th><th>标题</th><th>发布时间</th>
              <th>播放</th><th>点赞</th><th>评论</th>
              <th>观看分钟</th><th>平均观看</th><th>完播率</th>
            </tr>
          </thead>
          <tbody>${videoRows || '<tr><td colspan="9">区间内无视频数据</td></tr>'}</tbody>
        </table>
      </div>
      <p class="note">${escapeHtml(dataNote)}</p>
    </section>

    <section>
      <h2>🔍 关键发现</h2>
      ${
        best.title || best.summary
          ? `<div class="best">
        <p><strong>✅ 表现最好的内容</strong></p>
        <p><strong class="hl">${escapeHtml(String(best.title || ''))}</strong>
          ${best.summary ? ` — ${escapeHtml(String(best.summary))}` : ''}</p>
        ${bestReasons ? `<ul>${bestReasons}</ul>` : ''}
      </div>`
          : ''
      }
      ${
        issueRows
          ? `<p><strong>⚠️ 数据偏低 / 结构问题诊断</strong></p>
      <table class="issues">${issueRows}</table>`
          : ''
      }
    </section>

    <section>
      <h2>💡 优化建议</h2>
      ${suggestionBlocks || '<p class="note">暂无建议</p>'}
    </section>

    <section>
      <h2>有播放的日期明细</h2>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>日期</th><th>播放</th><th>点赞</th><th>评论</th>
              <th>观看分钟</th><th>平均观看</th><th>增粉</th><th>掉粉</th>
            </tr>
          </thead>
          <tbody>${dayRows || '<tr><td colspan="8">区间内无播放</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  </div>
  <script>
    const dayLabels = ${JSON.stringify(dayLabels)};
    const dayViews = ${JSON.stringify(dayViews)};
    const videoLabels = ${JSON.stringify(videoLabels)};
    const videoViews = ${JSON.stringify(videoViews)};
    const common = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };
    new Chart(document.getElementById('dayViews'), {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          data: dayViews,
          borderColor: '#c4302b',
          backgroundColor: 'rgba(196,48,43,.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 2
        }]
      },
      options: common
    });
    new Chart(document.getElementById('videoViews'), {
      type: 'bar',
      data: {
        labels: videoLabels,
        datasets: [{ data: videoViews, backgroundColor: '#0f766e' }]
      },
      options: common
    });
  </script>
</body>
</html>`;

  writeFileSync(outPath, html, 'utf8');
}
