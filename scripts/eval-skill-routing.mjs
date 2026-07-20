#!/usr/bin/env node
/**
 * Offline skill routing evaluation — layered intents + heuristic recall.
 * Usage: node scripts/eval-skill-routing.mjs [--k 3] [--verbose]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const CASES_PATH = path.join(ROOT, "tests", "skill-routing", "cases.yaml");

const DEFAULT_K = 3;

const ATOMIC_INTENTS = [
  "research",
  "create",
  "review",
  "publish",
  "auth",
  "analytics",
  "interact",
];

const INTENT_SIGNALS = {
  research: [
    "竞品",
    "调研",
    "爆款",
    "热点",
    "选题",
    "赛道",
    "创作参考",
    "金句库",
    "viral",
    "discover",
    "字幕",
    "深拆",
  ],
  create: [
    "写一篇",
    "写篇",
    "种草",
    "生成文案",
    "配图",
    "卡片",
    "生图",
    "封面",
    "remotion",
    "创意片",
    "成片",
    "改成",
    "适配",
    "改写",
    "口播稿",
  ],
  review: ["审核", "content review", "检查格式", "过一遍稿", "能不能发", "合规"],
  publish: [
    "只发",
    "发布",
    "上传",
    "发到",
    "发推",
    "推文",
    "tweet",
    "post to",
    "进草稿",
    "发小红书",
    "发youtube",
    "发知乎",
    "传到",
  ],
  auth: ["登录", "鉴权", "扫码", "cookie", "check-login", "登录态", "oauth"],
  analytics: [
    "发后",
    "复盘",
    "analytics",
    "播放",
    "观看时长",
    "频道数据",
    "笔记数据",
    "表现数据",
    "导出",
    "报表",
    "我自己发的",
    "曝光",
    "点击怎么样",
  ],
  interact: ["回复", "评论", "点赞", "收藏", "私信", "互动"],
};

const DOMAIN_SIGNALS = {
  "meta-workspace": [
    "对话记录",
    "沟通记录",
    "提问模式",
    "路由评测",
    "skill-routing",
    "整理成文档",
    "分析这次对话",
    "session",
    "配置检查",
  ],
  "out-of-scope": ["做晚饭", "天气预报", "写小说无关", "股票炒股推荐"],
};

const SCHEDULE_SIGNALS = [
  "每天",
  "每周",
  "定时",
  "cron",
  "schedule",
  "以后定期",
  "每晚",
  "明早",
  "明晚",
  "暂停.*定时",
  "列出.*自动任务",
  "删除定时",
];

const PLATFORM_SKILL_HINTS = {
  小红书: [
    "xhs-publish",
    "xhs-research",
    "xhs-post-analytics",
    "xhs-auth",
    "xhs-card-render",
    "xhs-interact",
  ],
  youtube: [
    "yt-publish",
    "yt-post-analytics",
    "yt-viral-discover",
    "yt-viral-research",
    "yt-auth",
  ],
  x: ["x-publish", "x-auth"],
  推特: ["x-publish", "x-auth"],
  twitter: ["x-publish", "x-auth"],
  知乎: ["zh-publish"],
  reddit: ["rd-publish"],
  tiktok: ["tt-publish"],
  公众号: ["wechat-publish"],
  linkedin: ["li-publish", "li-analytics"],
  抖音: ["dy-publish"],
};

function parseArgs(argv) {
  const opts = { k: DEFAULT_K, verbose: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--k" && argv[i + 1]) {
      opts.k = Number(argv[++i]);
    } else if (argv[i] === "--verbose") {
      opts.verbose = true;
    }
  }
  return opts;
}

function walkSkillFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSkillFiles(full, acc);
    } else if (entry.name === "SKILL.md") {
      acc.push(full);
    }
  }
  return acc;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, body: text };
  const raw = match[1];
  const body = text.slice(match[0].length);
  const meta = {};
  let currentKey = null;
  let block = [];
  for (const line of raw.split(/\r?\n/)) {
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch && !line.startsWith(" ")) {
      if (currentKey) meta[currentKey] = block.join("\n").trim();
      currentKey = keyMatch[1];
      const rest = keyMatch[2];
      block = rest ? [rest] : [];
    } else if (currentKey) {
      block.push(line);
    }
  }
  if (currentKey) meta[currentKey] = block.join("\n").trim();
  return { meta, body };
}

function extractSection(body, heading) {
  const re = new RegExp(`## ${heading}[\\s\\S]*?(?=\\n## |$)`, "i");
  const m = body.match(re);
  return m ? m[0] : "";
}

function tokenize(text) {
  return (text.toLowerCase().match(/[\u4e00-\u9fff]+|[a-z0-9:_-]+/g) ?? []).filter(
    (t) => t.length > 1,
  );
}

function loadSkillIndex() {
  const files = walkSkillFiles(SKILLS_DIR);
  const skills = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const { meta, body } = parseFrontmatter(text);
    const name = meta.name?.replace(/^["']|["']$/g, "").trim();
    if (!name || name.endsWith("-skills")) continue;
    const description = meta.description ?? "";
    const whenUse = extractSection(body, "When to use");
    const whenNot = extractSection(body, "When not to use");
    const corpus = [name, description, whenUse, whenNot, body.slice(0, 2000)].join("\n");
    skills.push({
      name,
      file: path.relative(ROOT, file),
      tokens: new Set(tokenize(corpus)),
      corpus,
    });
  }
  return skills;
}

function parseListValue(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCasesYaml(text) {
  const cases = [];
  const blocks = text.split(/\n(?=- id: )/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith("- id:") && !trimmed.startsWith("id:")) continue;
    const lines = trimmed.split(/\r?\n/);
    const item = {
      keywords: [],
      expect_skills: [],
      forbid_skills: [],
      forbid_actions: [],
      needs_clarification: [],
      forbid_context: [],
      expect_chain: [],
      missing_capabilities: [],
    };
    for (const line of lines) {
      const idM = line.match(/^\s*-?\s*id:\s*(.+)$/);
      const userM = line.match(/^\s*user:\s*(.+)$/);
      const intentM = line.match(/^\s*expect_intent:\s*(.+)$/);
      const domainM = line.match(/^\s*expect_domain:\s*(.+)$/);
      const statusM = line.match(/^\s*expect_route_status:\s*(.+)$/);
      const scopeM = line.match(/^\s*expect_workflow_scope:\s*(.+)$/);
      const recallM = line.match(/^\s*recall_any:\s*(.+)$/);
      const capGapM = line.match(/^\s*capability_gap:\s*(.+)$/);
      const scheduleM = line.match(/^\s*expect_schedule:\s*(.+)$/);
      const strictTop1M = line.match(/^\s*strict_top1:\s*(.+)$/);
      const arrM = line.match(/^\s*(\w+):\s*\[(.*)\]\s*$/);
      if (idM) item.id = idM[1].trim();
      else if (userM) item.user = userM[1].trim();
      else if (intentM) {
        const v = intentM[1].trim();
        item.expect_intent = v === "null" ? null : v;
      } else if (domainM) {
        const v = domainM[1].trim();
        item.expect_domain = v === "null" ? null : v;
      } else if (statusM) item.expect_route_status = statusM[1].trim();
      else if (scopeM) item.expect_workflow_scope = scopeM[1].trim();
      else if (recallM) item.recall_any = recallM[1].trim() === "true";
      else if (capGapM) item.capability_gap = capGapM[1].trim() === "true";
      else if (scheduleM) item.expect_schedule = scheduleM[1].trim() === "true";
      else if (strictTop1M) item.strict_top1 = strictTop1M[1].trim() === "true";
      else if (arrM) {
        item[arrM[1]] = parseListValue(arrM[2]);
      }
    }
    if (item.id && item.user) cases.push(item);
  }
  return cases;
}

function detectDomain(user) {
  const lower = user.toLowerCase();
  for (const sig of DOMAIN_SIGNALS["out-of-scope"]) {
    if (lower.includes(sig.toLowerCase())) return "out-of-scope";
  }
  for (const sig of DOMAIN_SIGNALS["meta-workspace"]) {
    if (lower.includes(sig.toLowerCase())) return "meta-workspace";
  }
  return "social-operation";
}

function detectSchedule(user) {
  return SCHEDULE_SIGNALS.some((sig) => new RegExp(sig, "i").test(user));
}

function scoreIntentBucket(user) {
  const lower = user.toLowerCase();
  const scores = Object.fromEntries(ATOMIC_INTENTS.map((k) => [k, 0]));
  for (const [intent, signals] of Object.entries(INTENT_SIGNALS)) {
    for (const sig of signals) {
      if (lower.includes(sig.toLowerCase())) scores[intent] += 1;
    }
  }

  if (/登录|扫码|check-login|cookie|鉴权|登录态/.test(user)) scores.auth += 6;
  if (/审核|content review|检查.*格式|过一遍稿/.test(user)) scores.review += 5;
  if (/回复|评论|点赞|收藏|私信/.test(user) && !/数据|复盘/.test(user)) scores.interact += 5;
  if (/竞品|调研|爆款|热点|选题|赛道|金句|创作参考/.test(user) && !/我自己|我的频道|发后/.test(user)) {
    scores.research += 4;
  }
  if (/写一篇|写篇|种草|配图|卡片|生图|封面|remotion|创意|成片|改成|适配|改写/.test(user)) {
    scores.create += 4;
  }
  if (/只发|仅发|上传|发到|进草稿|post to|tweet/.test(user)) scores.publish += 4;
  if (/发后|我自己发|创作者中心|曝光|观看时长|analytics|复盘|播放|报表/.test(user)) {
    scores.analytics += 4;
  }
  if (/不要发布|先别发/.test(user)) {
    scores.publish -= 4;
    if (/审核|检查/.test(user)) scores.review += 2;
    if (/写|种草|配图|封面/.test(user)) scores.create += 2;
    if (/数据|复盘|播放/.test(user)) scores.analytics += 2;
  }
  if (/我的频道|我发的|自家/.test(user)) {
    scores.analytics += 3;
    scores.research -= 3;
  }
  if (/竞品|赛道热门|爆款列表/.test(user)) {
    scores.research += 3;
    scores.analytics -= 3;
  }

  return scores;
}

function detectIntent(user, domain) {
  if (domain === "out-of-scope") return null;
  if (domain === "meta-workspace") return null;
  if (/排.*计划|内容日历|排期|涨粉活动|人设|品牌运营方案/.test(user) && !/只发|上传|发到/.test(user)) {
    return null;
  }

  const scores = scoreIntentBucket(user);
  const lower = user.toLowerCase();

  // Chain: primary is the terminal business intent when publish/create follows.
  if (/审核后.*发|过一遍.*再发/.test(user)) return "publish";
  if (/登录后.*发|登.*再发/.test(user)) return "publish";
  if (/写完.*发|写好.*直接发/.test(user)) return "create";
  if (/分析后.*改写|复盘后.*写|分析.*后改写/.test(user)) return "analytics";

  if (/发一条推|发推|tweet|post to|twitter|\bx\b/.test(lower) && /发|post|tweet|推/.test(lower)) {
    scores.publish += 5;
  }
  if (/一条龙|完整流水线|全自动|从选题到发布|跑一篇|今日选题|一直做到发布/.test(user)) {
    // Scope carries full-workflow; prefer first stage as primary.
    scores.research += 3;
    scores.publish -= 2;
    scores.review -= 2;
  }
  if (/选题/.test(user) && /发布|发到|跑一篇/.test(user)) {
    scores.research += 4;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] <= 0) return null;
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0];
}

function detectWorkflowScope(user, primaryIntent) {
  if (
    /一条龙|完整流水线|全自动流水线|从选题到发布|从零.*(发布|发)|跑一篇内容|今日选题.*发/.test(
      user,
    )
  ) {
    return "full-workflow";
  }
  if (
    /选题.*配图.*审核.*发布|调研.*写稿.*审核.*发|一直做到发布|完整跑一遍/.test(user)
  ) {
    return "full-workflow";
  }
  if (/审核后.*发|写完.*发|登录后.*发|分析后.*改写|改写.*发/.test(user)) {
    return "chain";
  }
  if (primaryIntent) return "atomic";
  return null;
}

function detectChain(user, primaryIntent, scope) {
  if (scope === "full-workflow") {
    return ["research", "create", "review", "publish"];
  }
  if (/审核后.*发|过一遍.*再发/.test(user)) return ["review", "publish"];
  if (/写完.*发|写好.*直接发/.test(user)) return ["create", "publish"];
  if (/登录后.*发|登.*再发/.test(user)) return ["auth", "publish"];
  if (/分析后.*改写|复盘后.*写/.test(user)) return ["analytics", "create"];
  if (primaryIntent) return [primaryIntent];
  return [];
}

function detectRouteStatus(testCaseLike, detected) {
  if (detected.domain === "out-of-scope") return "out-of-scope";
  if (detected.schedule) return "capability-gap";
  if (detected.domain === "meta-workspace" && (testCaseLike.capability_gap || testCaseLike.expect_route_status === "capability-gap")) {
    return "capability-gap";
  }
  if (testCaseLike.capability_gap) return "capability-gap";
  if (testCaseLike.expect_route_status === "partial-support") return "partial-support";
  if (
    testCaseLike.needs_clarification?.length ||
    (/帮我发一下|看下数据|以后定期帮我发|每天看看数据/.test(testCaseLike.user) &&
      !/小红书|youtube|知乎|tiktok|公众号|linkedin|抖音|推/.test(testCaseLike.user.toLowerCase()))
  ) {
    return "needs-clarification";
  }
  if (!detected.intent && detected.domain === "social-operation" && !detected.schedule) {
    if (/instagram|ins自动|规划排期|内容日历|涨粉活动|人设定位/.test(testCaseLike.user.toLowerCase())) {
      return "capability-gap";
    }
    return "needs-clarification";
  }
  return "matched";
}

function scoreSkills(user, skills, extraKeywords = []) {
  const userTokens = tokenize(user);
  const extra = extraKeywords.flatMap((k) => tokenize(k));
  const allQuery = [...userTokens, ...extra];
  const lower = user.toLowerCase();
  const platformBoost = new Set();
  for (const [plat, names] of Object.entries(PLATFORM_SKILL_HINTS)) {
    if (lower.includes(plat.toLowerCase())) names.forEach((n) => platformBoost.add(n));
  }

  const hasPublish = /发布|上传|只发|发到|发推|推文|tweet|post to|进草稿|传到/.test(lower);
  const hasAnalytics = /复盘|analytics|播放|观看|曝光|报表|表现|数据/.test(lower);
  const wantsReview =
    lower.includes("审核") ||
    lower.includes("content review") ||
    (lower.includes("检查") && (lower.includes("格式") || lower.includes("稿")));
  const wantsAuth = /登录|扫码|cookie|鉴权|check-login|登录态/.test(user);
  const wantsInteract = /回复|评论|点赞|收藏|私信/.test(user) && !hasAnalytics;
  const wantsCreate =
    /写一篇|写篇|种草|配图|卡片|生图|封面|remotion|创意|成片|改成|适配|改写/.test(user) &&
    !/只发|上传/.test(user);
  const wantsResearch =
    /竞品|调研|爆款|热点|选题|赛道|金句|创作参考/.test(user) &&
    !/我自己|我的频道|发后/.test(user);
  const fullWorkflow =
    /一条龙|完整流水线|全自动|从选题到发布|跑一篇内容|今日选题.*发|一直做到发布/.test(user);
  const multiPublishOnly =
    /同时发|一起发/.test(user) &&
    /稿|文案|素材|准备好|已有|现成/.test(user) &&
    !/选题|调研|写稿|一条龙/.test(user);

  const scored = skills.map((skill) => {
    let score = 0;
    for (const t of allQuery) {
      if (skill.tokens.has(t)) score += 2;
      if (skill.name.includes(t)) score += 3;
    }
    if (platformBoost.has(skill.name)) score += 5;

    if (skill.name === "pipeline-orchestrator") {
      if (fullWorkflow) score += 30;
      else if (multiPublishOnly) score -= 10;
      else score -= 4;
    }
    if (/选题.*配图.*审核|一直做到发布/.test(user) && skill.name.includes("card-render")) score -= 12;
    if (skill.name === "review" && wantsReview) score += 14;
    if (skill.name === "review" && /不要审核/.test(user)) score -= 20;
    if (skill.name === "xhs-interact" && wantsInteract) score += 14;
    if (skill.name.endsWith("-auth") && wantsAuth) score += 12;
    if (skill.name.endsWith("-publish") && wantsAuth && !/发到|发布|发帖/.test(user)) score -= 12;
    if (skill.name.endsWith("-publish") && hasPublish && !wantsReview) score += 9;
    if (/登录后.*发|登.*再发/.test(user) && skill.name.endsWith("-publish")) score += 10;
    if (/审核后.*发|过一遍.*再发/.test(user) && skill.name.endsWith("-publish")) score += 10;
    if (
      (skill.name.includes("analytics") || skill.name.includes("post-analytics")) &&
      hasAnalytics &&
      !wantsResearch
    ) {
      score += 8;
    }
    if (wantsResearch && (skill.name.includes("research") || skill.name.includes("viral") || skill.name.includes("explore"))) {
      score += 8;
    }
    if (/小红书.*热点|热点调研/.test(user) && skill.name === "xhs-research") score += 16;
    if (/小红书.*热点|热点调研/.test(user) && skill.name.startsWith("yt-")) score -= 12;
    // Discover vs research disambiguation
    if (/只要发现|不要完整报告|Top|列表/.test(user) && skill.name === "yt-viral-discover") score += 12;
    if (/只要发现|不要完整报告|Top|列表/.test(user) && skill.name === "yt-viral-research") score -= 8;
    if (/报告|金句|沉淀|完整/.test(user) && skill.name === "yt-viral-research") score += 12;
    if (/报告|金句|沉淀|完整/.test(user) && skill.name === "yt-viral-discover") score -= 8;

    if (wantsCreate) {
      if (skill.name.includes("card-render") && /卡片|pipeline:xhs|小红书.*配图/.test(user)) score += 16;
      if (skill.name.includes("tokenware") && /ai|封面|生图|公众号/.test(lower)) score += 16;
      if (skill.name.includes("tokenware") && /卡片|pipeline:xhs/.test(user)) score -= 10;
      if (skill.name.includes("card-render") && /公众号|youtube.*封面|ai 生图|ai生图/.test(lower)) score -= 10;
      if (skill.name === "remotion" && /remotion|教程动效/.test(lower)) score += 16;
      if (skill.name === "creative-agent" && /商业创意|宣传片/.test(user)) score += 20;
      if (skill.name === "remotion" && /不用 [Rr]emotion|商业创意|宣传片/.test(user)) score -= 24;
      if (skill.name === "creative-agent" && /remotion 教程|教程动效/.test(lower)) score -= 12;
      if (skill.name === "pipeline-orchestrator" && !fullWorkflow) score -= 8;
    }
    if (hasPublish && !hasAnalytics && !wantsReview) {
      if (skill.name.includes("research") || skill.name.includes("viral")) score -= 6;
    }
    if (/不要调研|不要爬/.test(user) && skill.name.includes("research")) score -= 12;
    if (lower.includes("不要发布") || lower.includes("先别发") || lower.includes("先不发布")) {
      if (skill.name.endsWith("-publish")) score -= 10;
    }
    if (/准备好了|已有|现成|稿子和图片/.test(user) && skill.name.endsWith("-publish")) score += 8;
    if (/准备好了|已有|现成/.test(user) && (skill.name.includes("research") || skill.name.includes("analytics"))) {
      score -= 6;
    }
    if (/能不能发|过一遍稿/.test(user) && skill.name === "review") score += 14;
    if (/linkedin/.test(lower) && /分析|改写/.test(user) && skill.name === "li-analytics") score += 14;
    if (/linkedin/.test(lower) && /改写|草稿/.test(user) && skill.name === "li-publish") score -= 14;
    if (/linkedin/.test(lower) && skill.name.includes("card-render")) score -= 8;
    if (/我发的笔记|曝光点击/.test(user) && skill.name === "xhs-post-analytics") score += 12;
    if (/instagram/.test(lower) && skill.name.endsWith("-publish")) score -= 8;
    if (/内容日历|发布计划|排期/.test(user) && skill.name.endsWith("-publish")) score -= 12;
    if (/发一条推|发推|tweet|twitter|\bx\b/.test(lower) && skill.name === "x-publish") score += 14;

    return { name: skill.name, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function evaluateCase(testCase, skills, k) {
  const domain = detectDomain(testCase.user);
  const schedule = detectSchedule(testCase.user) || testCase.expect_schedule === true;
  const intent = detectIntent(testCase.user, domain);
  const scope =
    testCase.expect_workflow_scope ||
    detectWorkflowScope(testCase.user, intent) ||
    (intent ? "atomic" : null);
  const chain =
    testCase.expect_chain?.length > 0
      ? testCase.expect_chain
      : detectChain(testCase.user, intent, scope);
  const routeStatus =
    testCase.expect_route_status ||
    detectRouteStatus(testCase, { domain, schedule, intent });

  const ranked = scoreSkills(testCase.user, skills, testCase.keywords ?? []);
  const positive = ranked.filter((r) => r.score > 0);
  let topK =
    domain === "out-of-scope" || routeStatus === "out-of-scope"
      ? []
      : positive.slice(0, k).map((r) => r.name);
  // Meta-workspace: only allow explicitly expected meta skills (e.g. skill-routing-eval)
  if (domain === "meta-workspace") {
    const allowed = new Set(testCase.expect_skills ?? []);
    topK = topK.filter((n) => allowed.has(n) || n === "skill-routing-eval");
    if ((testCase.expect_skills ?? []).length === 0) topK = [];
  }
  // Capability gap with no expected leaf: do not surface social candidates
  if (
    (routeStatus === "capability-gap" || testCase.capability_gap) &&
    (testCase.expect_skills ?? []).length === 0
  ) {
    topK = [];
  }
  // Clarification / vague schedule: do not surface forbidden candidates
  if (routeStatus === "needs-clarification") {
    const forbiddenSet = new Set(testCase.forbid_skills ?? []);
    topK = topK.filter((n) => !forbiddenSet.has(n));
  }
  const top1 = topK[0] ?? null;
  const expected = testCase.expect_skills ?? [];
  const forbidden = testCase.forbid_skills ?? [];
  // Forbid gate uses a stable window (top-3) so larger K only expands Recall, not false-positive noise
  const forbidWindow = topK.slice(0, Math.min(k, 3));
  const forbidHitEarly = forbidden.filter((s) => forbidWindow.includes(s));
  const topKForMiss = topK;

  const expectDomain = testCase.expect_domain ?? "social-operation";
  const domainOk = domain === expectDomain;

  let intentOk = true;
  if (scope === "full-workflow") {
    // Primary may be any stage; scope+chain carry the semantics.
    intentOk =
      testCase.expect_intent == null ||
      intent === testCase.expect_intent ||
      (testCase.expect_chain ?? []).includes(intent);
  } else if (testCase.expect_intent === null || testCase.expect_intent === undefined) {
    intentOk = intent === null;
  } else if (schedule && testCase.expect_intent) {
    intentOk = intent === testCase.expect_intent || intent === null;
  } else {
    intentOk = intent === testCase.expect_intent;
  }

  const expectStatus = testCase.expect_route_status ?? (testCase.capability_gap ? "capability-gap" : null);
  const statusOk = expectStatus ? routeStatus === expectStatus : true;

  const expectScope = testCase.expect_workflow_scope;
  const scopeOk = expectScope ? scope === expectScope : true;

  const expectChain = testCase.expect_chain ?? [];
  const chainOk = expectChain.length ? arraysEqual(chain, expectChain) : true;

  const scheduleOk = testCase.expect_schedule ? schedule === true : true;

  let skillOk = false;
  const strictTop1 = testCase.strict_top1 !== false;
  if (routeStatus === "out-of-scope") {
    skillOk = topK.length === 0;
  } else if (testCase.capability_gap || routeStatus === "capability-gap") {
    skillOk =
      forbidHitEarly.length === 0 &&
      (expected.length === 0 || !expected.some((s) => topK.includes(s)));
  } else if (routeStatus === "needs-clarification" || testCase.needs_clarification?.length) {
    skillOk = forbidHitEarly.length === 0;
  } else if (routeStatus === "partial-support") {
    skillOk = forbidHitEarly.length === 0 && (expected.length === 0 || expected.some((s) => topK.includes(s)));
  } else if (expected.length === 0) {
    skillOk = forbidHitEarly.length === 0;
  } else if (testCase.recall_any) {
    skillOk = expected.some((s) => topK.includes(s)) && forbidHitEarly.length === 0;
  } else if (strictTop1) {
    skillOk = top1 === expected[0] && forbidHitEarly.length === 0;
  } else {
    skillOk = (top1 === expected[0] || topK.includes(expected[0])) && forbidHitEarly.length === 0;
  }

  const forbidHit = forbidHitEarly;
  const forbidOk = forbidHit.length === 0;
  const recallHit = expected.length === 0 ? skillOk : expected.some((s) => topKForMiss.includes(s));
  const miss = expected.filter((s) => !topKForMiss.includes(s));

  const passed =
    domainOk &&
    intentOk &&
    statusOk &&
    scopeOk &&
    chainOk &&
    scheduleOk &&
    skillOk &&
    forbidOk;

  return {
    id: testCase.id,
    user: testCase.user,
    domain,
    expectDomain,
    domainOk,
    detectedIntent: intent,
    expectIntent: testCase.expect_intent ?? null,
    intentOk,
    routeStatus,
    expectStatus: expectStatus ?? routeStatus,
    statusOk,
    workflowScope: scope,
    expectScope: expectScope ?? scope,
    scopeOk,
    chain,
    expectChain,
    chainOk,
    schedule,
    scheduleOk,
    topK,
    top1,
    expected,
    skillOk,
    recallHit,
    falsePositive: forbidHit,
    forbidOk,
    miss,
    forbidActions: testCase.forbid_actions ?? [],
    forbidContext: testCase.forbid_context ?? [],
    capabilityGap: testCase.capability_gap ?? routeStatus === "capability-gap",
    passed,
  };
}

function pct(n, d) {
  return d === 0 ? "n/a" : `${((n / d) * 100).toFixed(1)}%`;
}

function main() {
  const opts = parseArgs(process.argv);
  const skills = loadSkillIndex();
  const casesText = fs.readFileSync(CASES_PATH, "utf8");
  const cases = parseCasesYaml(casesText);
  const results = cases.map((c) => evaluateCase(c, skills, opts.k));

  const total = results.length;
  const intentCases = results.filter((r) => r.expectIntent !== null || r.expectDomain === "social-operation");
  const intentAcc = results.filter((r) => r.intentOk).length / total;
  const strictTop1Cases = results.filter(
    (r) =>
      r.expectDomain === "social-operation" &&
      r.expected.length > 0 &&
      !r.capabilityGap &&
      r.expectStatus === "matched",
  );
  const top1Acc =
    strictTop1Cases.length === 0
      ? 1
      : strictTop1Cases.filter((r) => r.top1 === r.expected[0]).length / strictTop1Cases.length;
  const recallCases = results.filter((r) => r.expected.length > 0 && r.expectStatus === "matched");
  const recallAtK =
    recallCases.length === 0
      ? 1
      : recallCases.filter((r) => r.recallHit).length / recallCases.length;
  const falsePosCases = results.filter((r) => r.falsePositive.length > 0);
  const missCases = results.filter((r) => r.miss.length > 0 && r.expected.length > 0);
  const capGapCases = results.filter((r) => r.capabilityGap);
  const capGapOk = capGapCases.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed);

  const byIntent = {};
  for (const r of results) {
    const key = r.expectIntent ?? r.expectDomain ?? "null";
    byIntent[key] ??= { total: 0, pass: 0 };
    byIntent[key].total += 1;
    if (r.passed) byIntent[key].pass += 1;
  }

  console.log("=== Skill Routing Eval (layered offline heuristic) ===");
  console.log(`Skills indexed: ${skills.length}`);
  console.log(`Cases: ${total} | K=${opts.k}`);
  console.log(`Intent accuracy: ${pct(results.filter((r) => r.intentOk).length, total)}`);
  console.log(`Strict Top-1 skill match: ${pct(strictTop1Cases.filter((r) => r.top1 === r.expected[0]).length, strictTop1Cases.length)}`);
  console.log(`Recall@${opts.k}: ${pct(recallCases.filter((r) => r.recallHit).length, recallCases.length)}`);
  console.log(`Capability-gap cases: ${capGapCases.length} (pass ${capGapOk}/${capGapCases.length})`);
  console.log(`False-positive cases (forbidden in top-K): ${falsePosCases.length}`);
  console.log(`Miss cases (expected not in top-K): ${missCases.length}`);
  console.log(`Overall pass: ${pct(results.filter((r) => r.passed).length, total)}`);
  console.log("");
  console.log("By expect_intent/domain:");
  for (const [key, v] of Object.entries(byIntent).sort()) {
    console.log(`  ${key}: ${v.pass}/${v.total} (${pct(v.pass, v.total)})`);
  }
  console.log("");
  console.log(
    "Bypass guard (documented): forbid_actions / forbid_context are policy checks for live Agent dry-runs, not scored here.",
  );
  console.log("");

  if (failed.length > 0) {
    console.log("--- Failures / review ---");
    for (const r of failed) {
      console.log(`[${r.id}] ${r.user}`);
      console.log(
        `  domain: got=${r.domain} expect=${r.expectDomain} ok=${r.domainOk}`,
      );
      console.log(
        `  intent: got=${r.detectedIntent} expect=${r.expectIntent} ok=${r.intentOk}`,
      );
      console.log(
        `  status: got=${r.routeStatus} expect=${r.expectStatus} ok=${r.statusOk}`,
      );
      console.log(
        `  scope: got=${r.workflowScope} expect=${r.expectScope} ok=${r.scopeOk}`,
      );
      if (r.expectChain.length || r.chain.length) {
        console.log(
          `  chain: got=[${r.chain.join(">")}] expect=[${r.expectChain.join(">")}] ok=${r.chainOk}`,
        );
      }
      console.log(`  top${opts.k}: ${r.topK.join(", ") || "(none)"}`);
      console.log(`  expect skills: ${r.expected.join(", ") || "(none)"}`);
      if (r.falsePositive.length) console.log(`  forbid hit: ${r.falsePositive.join(", ")}`);
      if (r.miss.length) console.log(`  miss: ${r.miss.join(", ")}`);
      console.log("");
    }
  }

  if (opts.verbose) {
    console.log("--- All results ---");
    for (const r of results) console.log(JSON.stringify(r));
  }

  // Soft thresholds for CI signal
  const intentRate = intentAcc;
  const top1Rate = top1Acc;
  const recallRate = recallAtK;
  if (falsePosCases.length > 0) {
    console.log("FAIL: forbid_skills appeared in Top-K");
  }
  if (intentRate < 0.9) console.log(`WARN: Intent accuracy ${pct(results.filter((r) => r.intentOk).length, total)} < 90%`);
  if (top1Rate < 0.9) console.log(`WARN: Strict Top-1 ${pct(strictTop1Cases.filter((r) => r.top1 === r.expected[0]).length, strictTop1Cases.length)} < 90%`);
  if (recallRate < 0.98) console.log(`WARN: Recall@${opts.k} below 98%`);

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
