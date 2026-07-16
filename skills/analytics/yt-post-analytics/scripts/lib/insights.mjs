import { writeFileSync } from 'fs';

/**
 * 基于频道/视频数据生成「关键发现 + 优化建议」（对齐小红书复盘结构）
 */

/**
 * @param {unknown} iso
 * @returns {number | null}
 */
function parseIsoDurationSec(iso) {
  const s = String(iso || '');
  const m = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
}

/**
 * @param {number | null} sec
 */
function humanDuration(sec) {
  if (sec == null || !Number.isFinite(sec)) return '未知时长';
  if (sec < 60) return `${sec}秒短视频`;
  if (sec < 180) return `${Math.round(sec / 60)}分钟左右短内容`;
  if (sec < 600) return `${Math.round(sec / 60)}分钟中视频`;
  return `${Math.round(sec / 60)}分钟长视频`;
}

/**
 * @param {Record<string, unknown> | null | undefined} best
 */
function avgPctHint(best) {
  if (!best || best.averageViewPercentage == null) return 50;
  return Number(best.averageViewPercentage);
}

/**
 * @param {{
 *   channel: Record<string, unknown>,
 *   summary: Record<string, unknown>,
 *   videos: Array<Record<string, unknown>>,
 *   period: { startDate: string, endDate: string }
 * }} input
 */
export function buildInsights(input) {
  const { channel, summary, videos, period } = input;
  const subs = Number(channel.subscriberCount || 0);
  const publicVideos = Number(channel.videoCount || 0);
  const periodViews = Number(summary.views || 0);
  const periodLikes = Number(summary.likes || 0);
  const periodComments = Number(summary.comments || 0);
  const gained = Number(summary.subscribersGained || 0);
  const lost = Number(summary.subscribersLost || 0);

  const ranked = [...videos].sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
  const best = ranked[0] || null;
  const totalVideoViews = ranked.reduce((a, v) => a + (Number(v.views) || 0), 0) || 1;

  /** @type {{ best: Record<string, unknown>, issues: Array<{ problem: string, analysis: string }> }} */
  const findings = {
    best: {
      title: '暂无有效播放作品',
      summary: `区间 ${period.startDate} ~ ${period.endDate} 几乎没有 Analytics 播放样本`,
      reasons: ['样本不足时，先以稳定发布与选题测试为主，不宜过度解读单一指标'],
    },
    issues: [],
  };

  if (best && Number(best.views || 0) > 0) {
    const share = Math.round((Number(best.views || 0) / totalVideoViews) * 100);
    const avgPct = best.averageViewPercentage != null ? Number(best.averageViewPercentage) : null;
    const avgDur = Number(best.averageViewDuration || 0);
    const durSec = parseIsoDurationSec(best.duration);
    /** @type {string[]} */
    const reasons = [];

    if (share >= 50) {
      reasons.push(`区间内播放集中度高，约占分视频总播放的 ${share}%`);
    } else {
      reasons.push(`区间内播放相对领先（${best.views} 次），占比约 ${share}%`);
    }
    if (avgPct != null && avgPct >= 50) {
      reasons.push(`完播/平均观看比例约 ${avgPct.toFixed(1)}%，说明开场与信息密度对当前样本尚可`);
    } else if (avgPct != null && avgPct < 35) {
      reasons.push(`完播率约 ${avgPct.toFixed(1)}% 偏低，后续标题/前 3 秒仍有优化空间`);
    }
    if (avgDur > 0) {
      reasons.push(`平均观看约 ${avgDur} 秒（${humanDuration(durSec ?? avgDur)}）`);
    }
    if (Number(best.likes || 0) === 0 && Number(best.comments || 0) === 0) {
      reasons.push('有播放但互动几乎为 0，说明触达弱或内容未触发评论/点赞动机');
    }

    findings.best = {
      title: `「${best.title}」`,
      summary: `区间播放 ${best.views}、点赞 ${best.likes || 0}、评论 ${best.comments || 0}`,
      videoId: best.id,
      reasons,
    };
  }

  if (subs < 100) {
    findings.issues.push({
      problem: '粉丝/订阅基数偏小',
      analysis: `当前订阅约 ${subs}，仍属冷启动；优先验证「选题×时长×封面标题」组合，而不是追爆款话术`,
    });
  }
  if (publicVideos > 0 && publicVideos < 5) {
    findings.issues.push({
      problem: '成片数量不足',
      analysis: `公开视频约 ${publicVideos} 条，算法与人侧信号都偏弱；建议先冲到 8–12 条可对比的同赛道样本`,
    });
  }
  if (periodViews > 0 && periodViews < 50) {
    findings.issues.push({
      problem: '区间流量偏少',
      analysis: `近区间仅 ${periodViews} 次播放，数据噪声大；每条内容至少观察 48–72 小时再下结论`,
    });
  }
  if (periodViews > 0 && periodLikes + periodComments === 0) {
    findings.issues.push({
      problem: '有播放无互动',
      analysis: '说明内容可能停留在「被扫到一眼」而未形成行动；结尾加明确 CTA（关注/评论/下一集钩子）',
    });
  }
  if (gained === 0 && periodViews > 0) {
    findings.issues.push({
      problem: '播放未转化为订阅',
      analysis: '片头 3 秒未建立承诺价值，或结束屏/口头引导缺失；可在片尾固定「订阅+下期预告」模板',
    });
  }
  if (lost > gained && lost > 0) {
    findings.issues.push({
      problem: '净掉粉',
      analysis: `区间增粉 ${gained}、掉粉 ${lost}；检查是否标题党或受众不匹配`,
    });
  }

  const shortCount = ranked.filter((v) => {
    const sec = parseIsoDurationSec(v.duration);
    return sec != null && sec > 0 && sec < 60;
  }).length;
  if (shortCount > 0 && shortCount === ranked.length && periodViews > 0) {
    findings.issues.push({
      problem: '内容几乎全是超短片',
      analysis: '超短片适合测试钩子，但难沉淀搜索与系列；可穿插 5–12 分钟「步骤+案例」中长视频做主阵地',
    });
  }

  if (findings.issues.length === 0) {
    findings.issues.push({
      problem: '样本仍偏早期',
      analysis: '暂无明显结构性雷区；继续保持发布节奏，并记录每条「选题假设→结果」',
    });
  }

  /** @type {Array<Record<string, unknown>>} */
  const suggestions = [];
  const bestTitle = best?.title ? String(best.title) : '';

  suggestions.push({
    title: '标题迭代方向',
    items: [
      {
        bad: bestTitle || '描述性标题（如 auto-content-pipeline EN test）',
        good: bestTitle
          ? `把「${bestTitle.slice(0, 24)}」改成：数字+结果+人群，例如「7秒测通 EN 自动化？冷启动频道我靠这 3 步」`
          : '用「数字 + 结果 + 人群」：例「冷启动 YouTube 30 天从 0 粉到…我做对了这 3 步」',
      },
    ],
  });

  suggestions.push({
    title: '封面与前 3 秒',
    body:
      '封面：大字标题 + 一个对比数字/结果词；前 3 秒先抛冲突或结论，再铺垫产品/方法，避免片头 logo 空镜。',
  });

  suggestions.push({
    title: '互动引导',
    body:
      periodComments > 0
        ? '继续在片尾抛可选答案的二选一问题，便于观众评论。'
        : '片尾加明确 CTA：「你卡在选题还是剪辑？评论区打 1/2」；置顶评论复述问题可抬互动率。',
  });

  suggestions.push({
    title: '发布节奏',
    body:
      publicVideos < 8
        ? '建议每周至少 2 条同赛道内容（1 条钩子短测 + 1 条中长教学），先堆可对比样本。'
        : '维持稳定周更；同一选题至少测 2 个标题/封面变体。',
  });

  if (avgPctHint(best) < 40) {
    suggestions.push({
      title: '完播结构',
      body: '用「承诺→步骤清单→当场演示→复盘错误」降低中段流失；每 20–30 秒给一个新信息点或画面切换。',
    });
  } else {
    const bestName = String(findings.best.title || '')
      .replace(/[「」]/g, '')
      .trim();
    suggestions.push({
      title: '放大已验证结构',
      items: [
        {
          text: bestName
            ? `复用高完播结构：拆「${bestName}」为系列（问题篇 / 步骤篇 / 避坑篇）`
            : '把当前高完播结构拆成系列，降低选题成本',
        },
      ],
    });
  }

  return { findings, suggestions };
}

/**
 * @param {{ report: Record<string, unknown>, outPath: string, reportHtmlName: string }} opts
 */
export function writeNextCreativeRef(opts) {
  const { report, outPath, reportHtmlName } = opts;
  const channel = /** @type {Record<string, unknown>} */ (report.channel || {});
  const findings = /** @type {Record<string, unknown>} */ (report.findings || {});
  const best = /** @type {Record<string, unknown>} */ (findings.best || {});
  const issues = Array.isArray(findings.issues) ? findings.issues : [];
  const suggestions = Array.isArray(report.suggestions) ? report.suggestions : [];
  const period = /** @type {Record<string, unknown>} */ (report.period || {});

  const issueLines = issues
    .map((it) => {
      const row = /** @type {Record<string, unknown>} */ (it);
      return `- **${row.problem}**：${row.analysis}`;
    })
    .join('\n');

  const suggestLines = suggestions
    .map((s, i) => {
      const block = /** @type {Record<string, unknown>} */ (s);
      const items = Array.isArray(block.items) ? block.items : [];
      const itemText = items
        .map((it) => {
          const row = /** @type {Record<string, unknown>} */ (it);
          if (row.bad || row.good) return `  - ❌ ${row.bad} → ✅ ${row.good}`;
          return `  - ${row.text || row}`;
        })
        .join('\n');
      return `${i + 1}. **${block.title}**${block.body ? `\n   ${block.body}` : ''}${
        itemText ? `\n${itemText}` : ''
      }`;
    })
    .join('\n');

  const reasonLines = Array.isArray(best.reasons)
    ? best.reasons.map((r) => `  - ${r}`).join('\n')
    : '';

  const md = `# YouTube 下次创作参考

- 频道：${channel.title || ''}（${channel.customUrl || channel.id || ''}）
- 区间：${period.startDate || ''} ~ ${period.endDate || ''}
- 完整复盘：\`${reportHtmlName}\`

## 先记住

- 最佳样本：${best.title || '—'} — ${best.summary || ''}
${reasonLines}

## 问题诊断

${issueLines || '- （暂无）'}

## 下一篇优先做

${suggestLines || '- （暂无）'}
`;

  writeFileSync(outPath, md, 'utf8');
}
