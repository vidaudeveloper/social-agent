#!/usr/bin/env node
/**
 * 微信公众号发布 CLI
 * 默认 draft_only（进草稿箱）；full_publish 需显式 --mode full_publish
 *
 *   node skills/publish/wechat/scripts/cli.mjs check-login
 *   node skills/publish/wechat/scripts/cli.mjs publish --file article.md [--cover cover.png] [--mode draft_only]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { homedir } from 'os';
import { profileRoot, contentRoot } from '../../../../scripts/lib/content-paths.mjs';
import {
  clearProxyEnv,
  createDraft,
  freePublish,
  getAccessToken,
  parseFrontmatter,
  processArticleBody,
  resolveCoverPath,
  resolveWechatCredentials,
  uploadCoverMaterial,
} from './lib/wx-api.mjs';

function usage() {
  console.log(`用法:
  node skills/publish/wechat/scripts/cli.mjs check-login
  node skills/publish/wechat/scripts/cli.mjs publish --file <article.md> [--cover <path>] [--mode draft_only|full_publish] [--out <dir>] [--author <name>]

默认 mode=draft_only（推荐生产）。full_publish 可能与后台手动发布的首页行为不一致。`);
}

function envCandidatePaths() {
  return [
    join(profileRoot, '.env'),
    join(profileRoot, '.baoyu-skills', '.env'),
    join(homedir(), '.baoyu-skills', '.env'),
    join(process.cwd(), '.env'),
    join(process.cwd(), '.baoyu-skills', '.env'),
  ];
}

function parseArgs(argv) {
  const opts = {
    mode: 'draft_only',
    file: '',
    cover: '',
    out: '',
    author: '',
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file' || a === '-f') opts.file = argv[++i] ?? '';
    else if (a === '--cover') opts.cover = argv[++i] ?? '';
    else if (a === '--mode') opts.mode = argv[++i] ?? 'draft_only';
    else if (a === '--out' || a === '-o') opts.out = argv[++i] ?? '';
    else if (a === '--author') opts.author = argv[++i] ?? '';
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  if (opts.mode !== 'draft_only' && opts.mode !== 'full_publish') {
    console.error(`❌ 无效 --mode: ${opts.mode}（仅 draft_only | full_publish）`);
    process.exit(1);
  }
  return opts;
}

async function cmdCheckLogin() {
  clearProxyEnv();
  const creds = resolveWechatCredentials(envCandidatePaths());
  if (!creds.appId || !creds.appSecret) {
    console.error('❌ 未找到 WECHAT_APP_ID / WECHAT_APP_SECRET');
    console.error('请在 profile .env 中配置（见 distribution.yaml）');
    process.exit(1);
  }
  console.log(`凭证来源: ${creds.source === 'process.env' ? 'process.env' : 'env 文件'}`);
  console.log(`AppID: ${creds.appId.slice(0, 6)}…`);
  try {
    const token = await getAccessToken(creds.appId, creds.appSecret);
    console.log(`✅ access_token OK (${token.slice(0, 12)}…)`);
    console.log('下一步: 发布走草稿箱 → 你在 mp.weixin.qq.com 审阅后群发');
    process.exit(0);
  } catch (err) {
    console.error('❌ token 获取失败:', err.message);
    console.error('常见原因: AppSecret 错误 / IP 未加入公众平台白名单');
    process.exit(1);
  }
}

async function cmdPublish(opts) {
  clearProxyEnv();

  if (!opts.file) {
    console.error('❌ 需要 --file <article.md>');
    usage();
    process.exit(1);
  }

  const articlePath = resolve(opts.file);
  if (!existsSync(articlePath)) {
    console.error('❌ 文稿不存在:', articlePath);
    process.exit(1);
  }

  const articleDir = dirname(articlePath);
  const md = readFileSync(articlePath, 'utf-8');
  const { meta, body } = parseFrontmatter(md);
  const title = (meta.title || '').trim();
  if (!title) {
    console.error('❌ frontmatter 缺少 title');
    process.exit(1);
  }

  const coverPath = resolveCoverPath(meta.cover, articleDir, opts.cover);
  if (!coverPath || !existsSync(coverPath)) {
    console.error('❌ 缺少封面图（--cover 或同目录 cover.png / frontmatter cover）');
    process.exit(1);
  }

  const creds = resolveWechatCredentials(envCandidatePaths());
  if (!creds.appId || !creds.appSecret) {
    console.error('❌ 未找到 WECHAT_APP_ID / WECHAT_APP_SECRET');
    process.exit(1);
  }

  const author = opts.author || meta.author || '';
  const digest = meta.summary || meta.digest || '';

  console.log('=== 微信公众号发布 ===');
  console.log(`标题: ${title}`);
  console.log(`模式: ${opts.mode}`);
  console.log(`文稿: ${articlePath}`);
  console.log(`封面: ${coverPath}`);
  console.log(`凭证: ${creds.source === 'process.env' ? 'process.env' : 'env 文件'}`);

  if (opts.dryRun) {
    console.log('(--dry-run) 跳过实际上传');
    process.exit(0);
  }

  const outDir = opts.out
    ? resolve(opts.out)
    : join(contentRoot, '文章', '公众号', 'output');
  mkdirSync(outDir, { recursive: true });

  try {
    console.log('\n[1/5] 获取 access_token...');
    const token = await getAccessToken(creds.appId, creds.appSecret);

    console.log('\n[2/5] 上传封面...');
    const thumbMediaId = await uploadCoverMaterial(token, coverPath);
    console.log(`  thumb_media_id: ${thumbMediaId}`);

    console.log('\n[3/5] 处理正文图片并转 HTML...');
    const { htmlContent, uploadedImages } = await processArticleBody(
      token,
      body,
      articleDir,
    );
    console.log(`  正文图: ${uploadedImages} 张; HTML ${htmlContent.length} 字符`);

    console.log('\n[4/5] 创建草稿...');
    const draft = await createDraft(token, {
      title,
      content: htmlContent,
      digest,
      author,
      thumbMediaId,
    });
    console.log(`  media_id: ${draft.media_id}`);

    let publishResult = null;
    if (opts.mode === 'full_publish') {
      console.log('\n[5/5] freepublish 正式发布...');
      console.log(
        '  注意: API 发布成功 ≠ 后台手动发布的首页可见行为，请人工验收',
      );
      publishResult = await freePublish(token, draft.media_id);
    } else {
      console.log('\n[5/5] draft_only — 跳过正式发布');
      console.log('  请到 https://mp.weixin.qq.com/ 草稿箱审阅后群发');
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      mode: opts.mode,
      title,
      summary: digest,
      author,
      media_id: draft.media_id,
      thumb_media_id: thumbMediaId,
      article_path: articlePath,
      cover_path: coverPath,
      publish_id: publishResult?.publish_id || '',
      article_id: publishResult?.article_id || '',
      article_url: publishResult?.article_url || '',
      publish_status:
        publishResult?.publish_status === undefined
          ? null
          : publishResult.publish_status,
      note:
        opts.mode === 'draft_only'
          ? 'technical draft success; await manual MP publish'
          : 'API freepublish submitted; verify operational visibility in MP',
    };

    const outPath = join(outDir, 'publish_result.json');
    writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log('\n=== 完成 ===');
    console.log(`结果: ${outPath}`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      mode: opts.mode,
      title,
      error: err.message,
      article_path: articlePath,
    };
    const outPath = join(outDir, 'publish_result.json');
    writeFileSync(outPath, JSON.stringify(errorResult, null, 2), 'utf-8');
    console.error('\n发布失败:', err.message);
    console.error(`错误已写入: ${outPath}`);
    process.exit(1);
  }
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === '--help' || cmd === '-h') {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === 'check-login' || cmd === 'check') {
    await cmdCheckLogin();
    return;
  }

  if (cmd === 'publish') {
    const opts = parseArgs(rest);
    if (opts.help) {
      usage();
      process.exit(0);
    }
    await cmdPublish(opts);
    return;
  }

  console.error(`未知命令: ${cmd}`);
  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
