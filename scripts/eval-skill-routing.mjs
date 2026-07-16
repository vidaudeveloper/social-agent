#!/usr/bin/env node
/**
 * Offline skill routing evaluation — keyword/heuristic recall without LLM.
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

const INTENT_SIGNALS = {
  "content-pipeline": [
    "选题",
    "流水线",
    "分发",
    "各平台",
    "矩阵",
    "跑一篇",
    "全自动",
    "同时发",
    "多平台",
    "pipeline-orchestrator",
  ],
  "publish-single": [
    "只发",
    "发布",
    "上传",
    "发到",
    "发推",
    "推文",
    "一条推",
    "tweet",
    "post to",
    "进草稿",
    "发小红书",
    "发youtube",
    "发知乎",
  ],
  "analytics-post": [
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
    "不要发布",
  ],
  "focused-task": [
    "登录",
    "鉴权",
    "配图",
    "卡片",
    "审核",
    "竞品",
    "调研",
    "爆款",
    "remotion",
    "创意片",
    "生图",
    "封面",
    "content review",
    "检查这篇",
    "格式",
  ],
};

const PLATFORM_SKILL_HINTS = {
  小红书: ["xhs-publish", "xhs-research", "xhs-post-analytics", "xhs-auth", "xhs-card-render"],
  youtube: ["yt-publish", "yt-post-analytics", "yt-viral-discover", "yt-viral-research", "yt-auth"],
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

function parseCasesYaml(text) {
  const cases = [];
  const blocks = text.split(/\n(?=- id: )/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith("- id:") && !trimmed.startsWith("id:")) continue;
    const lines = trimmed.split(/\r?\n/);
    const item = { keywords: [], expect_skills: [], forbid_skills: [], forbid_actions: [], needs_clarification: [] };
    for (const line of lines) {
      const idM = line.match(/^\s*-?\s*id:\s*(.+)$/);
      const userM = line.match(/^\s*user:\s*(.+)$/);
      const intentM = line.match(/^\s*expect_intent:\s*(.+)$/);
      const recallM = line.match(/^\s*recall_any:\s*(.+)$/);
      const arrM = line.match(/^\s*(\w+):\s*\[(.*)\]\s*$/);
      if (idM) item.id = idM[1].trim();
      else if (userM) item.user = userM[1].trim();
      else if (intentM) {
        const v = intentM[1].trim();
        item.expect_intent = v === "null" ? null : v;
      } else if (recallM) item.recall_any = recallM[1].trim() === "true";
      else if (arrM) {
        const key = arrM[1];
        const vals = arrM[2]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        item[key] = vals;
      }
    }
    if (item.id && item.user) cases.push(item);
  }
  return cases;
}

function detectIntent(user) {
  const lower = user.toLowerCase();
  const scores = Object.fromEntries(
    Object.keys(INTENT_SIGNALS).map((k) => [k, 0]),
  );
  for (const [intent, signals] of Object.entries(INTENT_SIGNALS)) {
    for (const sig of signals) {
      if (lower.includes(sig.toLowerCase())) scores[intent] += 1;
    }
  }
  if (/选题|流水线|跑一篇|各平台|矩阵|同时发|小红书和|和知乎|多平台/.test(user)) {
    scores["content-pipeline"] += 3;
  }
  if (/只发|仅发/.test(user)) scores["publish-single"] += 2;
  if (/发后|我自己发|创作者中心|曝光|观看时长|不要发布/.test(user)) scores["analytics-post"] += 2;
  if (/审核|content review|检查.*格式/.test(user)) scores["focused-task"] += 3;
  if (/post to|twitter/.test(lower)) scores["publish-single"] += 3;
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] === 0) return null;
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0];
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

  const publishVerbs = ["发布", "上传", "只发", "发到", "发推", "推文", "tweet", "post to", "进草稿"];
  const analyticsVerbs = ["复盘", "analytics", "播放", "观看", "曝光", "报表", "表现", "数据"];
  const hasPublish = publishVerbs.some((v) => lower.includes(v.toLowerCase()));
  const hasAnalytics = analyticsVerbs.some((v) => lower.includes(v.toLowerCase()));
  const wantsReview =
    lower.includes("审核") ||
    lower.includes("content review") ||
    (lower.includes("检查") && (lower.includes("格式") || lower.includes("稿")));
  const multiPlatform =
    /同时|各平台|矩阵|小红书和|和知乎|多平台/.test(user) ||
    (lower.includes("小红书") && lower.includes("知乎"));

  const scored = skills.map((skill) => {
    let score = 0;
    for (const t of allQuery) {
      if (skill.tokens.has(t)) score += 2;
      if (skill.name.includes(t)) score += 3;
    }
    if (platformBoost.has(skill.name)) score += 5;
    if (skill.corpus.toLowerCase().includes(lower.slice(0, 20))) score += 1;

    if (skill.name === "pipeline-orchestrator" && multiPlatform) score += 12;
    if (
      skill.name === "pipeline-orchestrator" &&
      (lower.includes("选题") || lower.includes("跑一篇") || lower.includes("各平台") || lower.includes("流水线"))
    ) {
      score += 14;
    }
    if (skill.name === "review" && wantsReview) score += 12;
    if (skill.name.endsWith("-publish") && hasPublish && !hasAnalytics && !wantsReview) score += 9;
    if (
      (skill.name.includes("analytics") || skill.name.includes("post-analytics")) &&
      hasAnalytics &&
      !wantsReview
    ) {
      score += 8;
    }
    if (hasPublish && !hasAnalytics && !wantsReview) {
      if (skill.name.includes("research") || skill.name.includes("viral")) score -= 4;
      if (skill.name.includes("card-render")) score -= 3;
    }
    if (lower.includes("不要发布")) {
      if (skill.name.endsWith("-publish")) score -= 8;
      if (skill.name.includes("analytics") || skill.name.includes("post-analytics")) score += 6;
    }

    return { name: skill.name, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}

function evaluateCase(testCase, skills, k) {
  const ranked = scoreSkills(testCase.user, skills, testCase.keywords ?? []);
  const topK = ranked.slice(0, k).map((r) => r.name);
  const top1 = topK[0] ?? null;
  const expected = testCase.expect_skills ?? [];
  const forbidden = testCase.forbid_skills ?? [];
  const detectedIntent = detectIntent(testCase.user);

  let intentOk = true;
  if (testCase.expect_intent === null) {
    intentOk = detectedIntent === null || testCase.needs_clarification?.length > 0;
  } else {
    intentOk = detectedIntent === testCase.expect_intent;
  }

  let skillOk = false;
  if (testCase.needs_clarification?.length) {
    skillOk = true;
  } else if (expected.length === 0) {
    skillOk = top1 === null || topK.every((s) => ranked.find((r) => r.name === s)?.score === 0);
  } else if (testCase.recall_any) {
    skillOk = expected.some((s) => topK.includes(s));
  } else {
    skillOk = top1 === expected[0] || (expected.length === 1 && topK.includes(expected[0]));
  }

  const recallHit = expected.some((s) => topK.includes(s));
  const falsePositive = forbidden.filter((s) => topK.includes(s));
  const miss = expected.filter((s) => !topK.includes(s));

  return {
    id: testCase.id,
    user: testCase.user,
    detectedIntent,
    expectIntent: testCase.expect_intent,
    intentOk,
    topK,
    top1,
    expected,
    skillOk,
    recallHit,
    falsePositive,
    miss,
    forbidActions: testCase.forbid_actions ?? [],
  };
}

function main() {
  const opts = parseArgs(process.argv);
  const skills = loadSkillIndex();
  const casesText = fs.readFileSync(CASES_PATH, "utf8");
  const cases = parseCasesYaml(casesText);

  const results = cases.map((c) => evaluateCase(c, skills, opts.k));

  const total = results.length;
  const intentAcc = results.filter((r) => r.intentOk).length / total;
  const top1Acc = results.filter((r) => r.skillOk).length / total;
  const recallAtK = results.filter((r) => r.recallHit || (r.expected.length === 0 && r.skillOk)).length / total;
  const falsePosCases = results.filter((r) => r.falsePositive.length > 0);
  const missCases = results.filter((r) => r.miss.length > 0 && r.expected.length > 0);

  console.log("=== Skill Routing Eval (offline heuristic) ===");
  console.log(`Skills indexed: ${skills.length}`);
  console.log(`Cases: ${total} | K=${opts.k}`);
  console.log(`Intent accuracy: ${(intentAcc * 100).toFixed(1)}%`);
  console.log(`Top-1 skill match: ${(top1Acc * 100).toFixed(1)}%`);
  console.log(`Recall@${opts.k}: ${(recallAtK * 100).toFixed(1)}%`);
  console.log(`False-positive cases (forbidden in top-K): ${falsePosCases.length}`);
  console.log(`Miss cases (expected not in top-K): ${missCases.length}`);
  console.log("");
  console.log("Bypass guard (documented): forbid_actions in cases are policy checks for live Agent runs, not scored here.");
  console.log("");

  const failed = results.filter((r) => !r.skillOk || (!r.intentOk && r.expectIntent !== null));
  if (failed.length > 0) {
    console.log("--- Failures / review ---");
    for (const r of failed) {
      console.log(`[${r.id}] ${r.user}`);
      console.log(`  intent: got=${r.detectedIntent} expect=${r.expectIntent} ok=${r.intentOk}`);
      console.log(`  top${opts.k}: ${r.topK.join(", ")}`);
      console.log(`  expect: ${r.expected.join(", ") || "(none)"}`);
      if (r.falsePositive.length) console.log(`  forbid hit: ${r.falsePositive.join(", ")}`);
      if (r.miss.length) console.log(`  miss: ${r.miss.join(", ")}`);
      console.log("");
    }
  }

  if (opts.verbose) {
    console.log("--- All results ---");
    for (const r of results) {
      console.log(JSON.stringify(r));
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
