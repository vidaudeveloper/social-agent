#!/usr/bin/env node
/**
 * YouTube Skills 统一 CLI（仅 sau / social-auto-upload 单路径）
 *
 * 用法:
 *   node skills/publish/youtube/scripts/cli.mjs <command> [options]
 */
import { cmdCheckLogin, cmdLogin } from './commands/auth.mjs';
import { cmdPublish } from './commands/publish.mjs';
import { cmdCreateVideo, cmdPipeline } from './commands/pipeline.mjs';
import { requireOverseasConsent } from '../../../../scripts/lib/overseas-guard.mjs';

const USAGE = `YouTube Skills CLI（仅 sau 单路径）

命令:
  login                    一次性登录（cookie 存 tool/social-auto-upload/cookies/）
  check-login              检查 sau cookie（尽量少用；失败勿立即 re-login）
  publish                  上传并发布视频（日常主命令）
  create-video             TTS + 合成 16:9 视频（不发布）
  pipeline                 用户画像 → 创作 → 发布 全流程

publish 参数:
  --video, -v <path>       视频绝对路径
  --title, -t <text>       标题
  --description, -d <text> 描述（可选）
  --privacy, -p <level>    public | unlisted | private（默认 unlisted）

环境变量:
  OVERSEAS_ALLOW_AUTOMATION  海外 login/check/publish 总开关（Agent 默认关闭）
  YOUTUBE_ACCOUNT_ID         sau 账号名（默认 default）
  SAU_ROOT                   social-auto-upload 路径
  SAU_HEADED=true            login 时有头模式
  YOUTUBE_CHANNEL_ID         频道 ID
  VIDEO_PRIVACY              可见性
  HERMES_ROOT                内容归档根目录（默认 ./content）
  USER_PROFILE_PATH          用户画像路径

登录态:
  唯一 cookie 文件: tool/social-auto-upload/cookies/youtube_<account>.json
  国内请在 tool/social-auto-upload/conf.py 配置 YT_PROXY
`;

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const handlers = {
  'check-login': () => {
    requireOverseasConsent('youtube', 'check-login');
    return cmdCheckLogin();
  },
  login: () => {
    requireOverseasConsent('youtube', 'login');
    return cmdLogin();
  },
  publish: () => {
    requireOverseasConsent('youtube', 'publish');
    return cmdPublish(rest);
  },
  'create-video': () => cmdCreateVideo(rest),
  pipeline: () => {
    requireOverseasConsent('youtube', 'pipeline');
    return cmdPipeline();
  },
};

const handler = handlers[command];
if (!handler) {
  console.error(`未知命令: ${command}\n`);
  console.log(USAGE);
  process.exit(1);
}

await handler();
