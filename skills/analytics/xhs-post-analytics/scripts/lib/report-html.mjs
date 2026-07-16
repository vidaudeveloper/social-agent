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
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return String(v);
}

/**
 * 发布后作品复盘 HTML（结构对齐对话里的「账号作品数据全分析」）
 * @param {{ report: Record<string, unknown>, outPath: string }} opts
 */
export function writePostPublishReportHtml(opts) {
  const { report, outPath } = opts;
  const account = /** @type {Record<string, unknown>} */ (report.account || {});
  const posts = Array.isArray(report.posts) ? report.posts : [];
  const findings = /** @type {Record<string, unknown>} */ (report.findings || {});
  const best = /** @type {Record<string, unknown>} */ (findings.best || {});
  const issues = Array.isArray(findings.issues) ? findings.issues : [];
  const suggestions = Array.isArray(report.suggestions) ? report.suggestions : [];
  const title = String(report.title || '小红书账号作品数据全分析');
  const generatedAt = String(report.generatedAt || formatBeijingTime());
  const dataNote = String(
    report.dataNote ||
      '注：互动与曝光等数据来源于创作者中心「内容分析 → 导出数据」xlsx',
  );

  const summary = /** @type {Record<string, unknown>} */ (report.summary || {});
  const summaryBits = [
    summary.postCount != null ? `笔记 ${summary.postCount}` : '',
    summary.impressions != null ? `曝光合计 ${formatNum(summary.impressions)}` : '',
    summary.views != null ? `观看合计 ${formatNum(summary.views)}` : '',
  ].filter(Boolean);
  const summaryLine = summaryBits.length
    ? `<tr><th>区间汇总</th><td>${summaryBits.join(' · ')}</td></tr>`
    : '';

  const accountRows = [
    ['昵称', account.nickname],
    ['小红书号', account.redId],
    ['简介', account.desc],
    ['IP属地', account.ipLocation],
    ['粉丝', account.fans],
    ['关注', account.following],
    ['获赞与收藏', account.likedCollected],
  ]
    .filter(([, v]) => v != null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><th>${escapeHtml(String(k))}</th><td>${escapeHtml(String(v))}</td></tr>`,
    )
    .join('\n') + summaryLine;

  const postRows = posts
    .map((p, i) => {
      const row = /** @type {Record<string, unknown>} */ (p);
      const ctr =
        row.coverCtr != null && row.coverCtr !== ''
          ? `${Number(row.coverCtr).toFixed(1)}%`
          : '—';
      const dur =
        row.avgWatchDurationSec != null && row.avgWatchDurationSec !== ''
          ? `${Number(row.avgWatchDurationSec)}s`
          : '—';
      return `<tr>
        <td>${i + 1}</td>
        <td class="title">${escapeHtml(String(row.title || ''))}</td>
        <td>${escapeHtml(String(row.publishedAt || '—'))}</td>
        <td>${escapeHtml(String(row.genre || '—'))}</td>
        <td>${formatNum(row.impressions)}</td>
        <td>${formatNum(row.views)}</td>
        <td>${escapeHtml(ctr)}</td>
        <td>${formatNum(row.likedCount)}</td>
        <td>${formatNum(row.collectedCount)}</td>
        <td>${formatNum(row.commentCount)}</td>
        <td>${formatNum(row.fanGrowth)}</td>
        <td>${formatNum(row.sharedCount)}</td>
        <td>${escapeHtml(dur)}</td>
      </tr>`;
    })
    .join('\n');

  const impressionData = posts.map((p) =>
    Number(/** @type {any} */ (p).impressions || 0),
  );
  const viewData = posts.map((p) => Number(/** @type {any} */ (p).views || 0));
  const likeData = posts.map((p) => Number(/** @type {any} */ (p).likedCount || 0));
  const ctrData = posts.map((p) => Number(/** @type {any} */ (p).coverCtr || 0));
  const labels = posts.map((p, i) =>
    `${i + 1}.${String(/** @type {any} */ (p).title || '').slice(0, 12)}`,
  );

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
      --bg: #f7f8fa;
      --card: #fff;
      --text: #1f2329;
      --muted: #646a73;
      --line: #e5e6eb;
      --accent: #ff2442;
      --ok: #00b578;
      --warn: #ff8f1f;
      --soft: #f2f3f5;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "PingFang SC", "Segoe UI", "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    .wrap { max-width: 920px; margin: 0 auto; padding: 28px 18px 64px; }
    h1 { font-size: 1.55rem; margin: 0 0 8px; }
    .sub { color: var(--muted); margin: 0 0 22px; font-size: .92rem; }
    section {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 16px;
    }
    section h2 {
      margin: 0 0 14px;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    table { width: 100%; border-collapse: collapse; font-size: .92rem; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-weight: 600; width: 28%; background: var(--soft); }
    .posts th { width: auto; white-space: nowrap; }
    .posts td.title { font-weight: 600; }
    .note { color: var(--muted); font-size: .85rem; margin-top: 10px; }
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .chart-box {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px 16px;
    }
    .chart-box h2 { margin: 0 0 8px; font-size: .95rem; color: var(--muted); }
    .best {
      background: #f0faf4;
      border: 1px solid #c6f0d8;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .best strong.hl { color: var(--accent); }
    .issues th { width: 30%; }
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
    @media (max-width: 720px) {
      .charts { grid-template-columns: 1fr; }
      .posts { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>📊 ${escapeHtml(title)}</h1>
    <p class="sub">账号「${escapeHtml(String(account.nickname || ''))}」 · 生成于 ${escapeHtml(generatedAt)}（北京时间） · 共 ${posts.length} 篇作品</p>

    <section>
      <h2>👤 账号概况</h2>
      <table>${accountRows}</table>
    </section>

    <div class="charts">
      <div class="chart-box"><h2>曝光对比</h2><canvas id="impressions" height="160"></canvas></div>
      <div class="chart-box"><h2>观看对比</h2><canvas id="views" height="160"></canvas></div>
    </div>
    <div class="charts">
      <div class="chart-box"><h2>点赞对比</h2><canvas id="likes" height="160"></canvas></div>
      <div class="chart-box"><h2>封面点击率(%)</h2><canvas id="ctr" height="160"></canvas></div>
    </div>

    <section>
      <h2>📋 作品数据总览（共${posts.length}篇）</h2>
      <div class="posts">
        <table>
          <thead>
            <tr>
              <th>#</th><th>标题</th><th>发布时间</th><th>体裁</th>
              <th>曝光</th><th>观看</th><th>封面CTR</th>
              <th>点赞</th><th>收藏</th><th>评论</th><th>涨粉</th><th>分享</th><th>人均观看</th>
            </tr>
          </thead>
          <tbody>${postRows}</tbody>
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
          ? `<p><strong>⚠️ 数据偏低的问题诊断</strong></p>
      <table class="issues">${issueRows}</table>`
          : ''
      }
    </section>

    <section>
      <h2>💡 优化建议</h2>
      ${suggestionBlocks || '<p class="note">暂无建议</p>'}
    </section>
  </div>
  <script>
    const labels = ${JSON.stringify(labels)};
    const impressions = ${JSON.stringify(impressionData)};
    const views = ${JSON.stringify(viewData)};
    const likes = ${JSON.stringify(likeData)};
    const ctrs = ${JSON.stringify(ctrData)};
    const common = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };
    new Chart(document.getElementById('impressions'), {
      type: 'bar',
      data: { labels, datasets: [{ data: impressions, backgroundColor: '#5b8ff9' }] },
      options: common
    });
    new Chart(document.getElementById('views'), {
      type: 'bar',
      data: { labels, datasets: [{ data: views, backgroundColor: '#5ad8a6' }] },
      options: common
    });
    new Chart(document.getElementById('likes'), {
      type: 'bar',
      data: { labels, datasets: [{ data: likes, backgroundColor: '#ff6b81' }] },
      options: common
    });
    new Chart(document.getElementById('ctr'), {
      type: 'bar',
      data: { labels, datasets: [{ data: ctrs, backgroundColor: '#ff8f1f' }] },
      options: common
    });
  </script>
</body>
</html>`;

  writeFileSync(outPath, html, 'utf8');
}
