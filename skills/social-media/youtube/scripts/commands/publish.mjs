import { existsSync } from 'fs';
import { sauAccount, runSau, sauAvailable } from '../../../../scripts/lib/sau.mjs';

function parseArgs(argv) {
  const opts = { privacy: process.env.VIDEO_PRIVACY || 'unlisted' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--video' || a === '-v') opts.video = argv[++i];
    else if (a === '--title' || a === '-t') opts.title = argv[++i];
    else if (a === '--description' || a === '-d') opts.description = argv[++i];
    else if (a === '--privacy' || a === '-p') opts.privacy = argv[++i];
    else if (a === '--tags') opts.tags = argv[++i];
    else if (a === '--playlist') opts.playlist = argv[++i];
    else if (!a.startsWith('-') && !opts.video) opts.video = a;
    else if (!a.startsWith('-') && !opts.title) opts.title = a;
    else if (!a.startsWith('-') && !opts.description) opts.description = a;
  }
  opts.video = process.env.VIDEO_PATH || opts.video;
  opts.title = process.env.VIDEO_TITLE || opts.title || 'YouTube upload';
  opts.description = process.env.VIDEO_DESC || opts.description || '';
  return opts;
}

function mapVisibility(privacy) {
  if (privacy === 'public') return 'public';
  if (privacy === 'private') return 'private';
  return 'unlisted';
}

export async function cmdPublish(argv) {
  const opts = parseArgs(argv);
  const { video, title, description, privacy, tags, playlist } = opts;

  if (!video || !existsSync(video)) {
    console.error('用法: cli.mjs publish --video <绝对路径> --title "标题" [--description "描述"] [--privacy unlisted]');
    process.exit(1);
  }

  if (!sauAvailable()) {
    console.error('social-auto-upload 未安装。请运行: npm run overseas:install');
    process.exit(1);
  }

  const account = sauAccount('youtube');
  const args = [
    'youtube',
    'upload-video',
    '--account',
    account,
    '--file',
    video,
    '--title',
    title,
    '--desc',
    description,
    '--visibility',
    mapVisibility(privacy),
  ];
  if (tags) args.push('--tags', tags);
  if (playlist) args.push('--playlist', playlist);

  console.log('=== YouTube 发布（sau / social-auto-upload）===\n');
  console.log('ℹ️  单次发布只开一个浏览器窗口；请勿并行跑 check-login/login。');
  console.log('    sau 会在上传流程内检测登录态，发布前无需 check。\n');
  // YouTube Studio 拦截 headless Chrome，必须 headed 模式
  // --headed 需放在子命令后（youtube upload-video --headed ...）
  args.push('--headed');
  runSau(args);
  console.log('\n✅ sau youtube 发布完成');
  process.exit(0);
}
