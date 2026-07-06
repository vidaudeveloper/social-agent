/**
 * @deprecated 请使用 skills/content-reviewer/scripts/lib/reddit.mjs
 * 保留 re-export 以兼容 npm run reddit:validate 与 reddit CLI。
 */
export {
  shouldValidateCommand,
  collectPublishPayload,
  validateRedditPublish,
  formatValidationReport,
} from '../../skills/content-reviewer/scripts/lib/reddit.mjs';
