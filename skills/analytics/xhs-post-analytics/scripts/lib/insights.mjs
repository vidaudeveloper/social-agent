/**
 * 基于创作者中心导出数据生成关键发现 + 优化建议
 */

/**
 * @param {Array<Record<string, unknown>>} posts
 * @param {Record<string, unknown>} summary
 * @param {{ nickname?: string }} account
 */
export function buildInsightsFromExport({ posts, summary, account }) {
  const ranked = [...posts].sort(
    (a, b) => Number(b.impressions || b.views || 0) - Number(a.impressions || a.views || 0),
  );
  const best = ranked[0] || null;
  const totalImp = Number(summary.impressions || 0) || 1;
  const totalViews = Number(summary.views || 0);
  const totalEngage =
    Number(summary.likedCount || 0) +
    Number(summary.commentCount || 0) +
    Number(summary.collectedCount || 0);

  /** @type {{ best: Record<string, unknown>, issues: Array<{ problem: string, analysis: string }> }} */
  const findings = {
    best: {
      title: '暂无有效样本',
      summary: '导出表无笔记行',
      reasons: ['先确认创作者中心已导出近区间笔记数据'],
    },
    issues: [],
  };

  if (best && (Number(best.impressions) > 0 || Number(best.views) > 0)) {
    const share = Math.round((Number(best.impressions || 0) / totalImp) * 100);
    const ctr = best.coverCtr != null ? Number(best.coverCtr) : null;
    const avgDur = Number(best.avgWatchDurationSec || 0);
    /** @type {string[]} */
    const reasons = [];
    reasons.push(
      `曝光 ${best.impressions ?? 0}、观看 ${best.views ?? 0}` +
        (share ? `，约占区间总曝光 ${share}%` : ''),
    );
    if (ctr != null) {
      if (ctr >= 10) reasons.push(`封面点击率 ${ctr}% ，封面吸引力相对更好`);
      else reasons.push(`封面点击率仅 ${ctr}% ，封面/标题需加强钩子`);
    }
    if (avgDur > 0) reasons.push(`人均观看约 ${avgDur} 秒`);
    const eng =
      Number(best.likedCount || 0) +
      Number(best.commentCount || 0) +
      Number(best.collectedCount || 0);
    if (Number(best.views || 0) > 0 && eng === 0) {
      reasons.push('有观看无赞藏评，内容未触发互动动机');
    }
    findings.best = {
      title: `「${best.title}」`,
      summary: `曝光${best.impressions ?? 0} / 观看${best.views ?? 0} / CTR ${ctr ?? '—'}%`,
      reasons,
    };
  }

  const avgCtr =
    posts.length > 0
      ? posts.reduce((a, p) => a + Number(p.coverCtr || 0), 0) / posts.length
      : 0;

  if (totalImp > 0 && totalImp < 500) {
    findings.issues.push({
      problem: '整体曝光偏少',
      analysis: `区间总曝光约 ${totalImp}，流量池仍浅；优先测封面与标题，再谈投流`,
    });
  }
  if (totalViews > 0 && totalEngage === 0) {
    findings.issues.push({
      problem: '有观看无互动',
      analysis: '文末缺明确 CTA（提问/收藏清单）；开头未给「可保存」的信息密度',
    });
  }
  if (avgCtr > 0 && avgCtr < 8) {
    findings.issues.push({
      problem: '封面点击率偏低',
      analysis: `均 CTR 约 ${avgCtr.toFixed(1)}% ；建议大字标题+数字对比，减少信息过载封面`,
    });
  }
  const lowWatch = posts.filter((p) => Number(p.avgWatchDurationSec || 0) > 0 && Number(p.avgWatchDurationSec) < 15);
  if (lowWatch.length >= Math.max(2, Math.floor(posts.length / 2))) {
    findings.issues.push({
      problem: '人均观看时长偏短',
      analysis: '多数笔记人均观看 <15 秒，前屏未留住人；首图/首段需更快给结论',
    });
  }
  if (Number(summary.fanGrowth || 0) === 0 && totalViews > 0) {
    findings.issues.push({
      problem: '观看未转化为涨粉',
      analysis: '简介与主页未承接；笔记内缺少「关注后能持续获得什么」的承诺',
    });
  }
  if (findings.issues.length === 0) {
    findings.issues.push({
      problem: '样本仍可继续积累',
      analysis: '暂无极端短板；保持同赛道连发并记录每条假设→结果',
    });
  }

  /** @type {Array<Record<string, unknown>>} */
  const suggestions = [];
  const bestTitle = best?.title ? String(best.title) : '';

  suggestions.push({
    title: '标题迭代方向',
    items: [
      {
        bad: bestTitle || '描述性标题',
        good: bestTitle
          ? `保留核心词，加上数字/冲突：例「${bestTitle.slice(0, 12)}…」→「7 天实测：${bestTitle.slice(0, 10)}，踩坑的人都忽略了这点」`
          : '用「数字 + 结果 + 人群痛点」改写标题',
      },
    ],
  });

  suggestions.push({
    title: '封面与 CTR',
    body:
      avgCtr < 10
        ? '封面只留 1 句大字结论 + 1 个数字；避免多行小字。对 CTR<8% 的笔记优先重做封面再观察 48h。'
        : 'CTR 尚可，下一篇可做 A/B：同文案两套封面测点击率。',
  });

  suggestions.push({
    title: '互动与涨粉',
    body:
      totalEngage === 0
        ? '文末固定模板：「你卡在哪一步？评论 1/2/3」+「收藏这篇当清单」；主页简介写清更新节奏。'
        : '把高互动结构拆成系列（问题篇/步骤篇/避坑篇），引导主页连看。',
  });

  suggestions.push({
    title: '发布节奏',
    body:
      posts.length < 8
        ? `当前导出 ${posts.length} 条，建议同赛道每周 ≥2 条，先堆够可对比样本。`
        : '维持周更；对曝光高但 CTR 低的条目优先改封面，对 CTR 高但互动低的条目改文案 CTA。',
  });

  if (account?.nickname) {
    suggestions.push({
      title: '账号定位复核',
      body: `以「${account.nickname}」人设检查：封面视觉与标题是否同一赛道；混发易稀释推荐。`,
    });
  }

  return { findings, suggestions };
}
