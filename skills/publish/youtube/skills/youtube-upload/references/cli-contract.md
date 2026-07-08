# YouTube CLI 契约（sau）

## 登录

```bash
sau youtube login --account <account>
```

Cookie 保存到 `cookies/youtube_<account>.json`。

## 校验

```bash
sau youtube check --account <account>
```

预期输出：`valid` 或 `invalid`（尽量少用；失败勿立即 re-login）。

## 上传视频

```bash
sau youtube upload-video \
  --account <account> \
  --file <video-path> \
  --title "<title>" \
  [--desc "<description>"] \
  [--tags tag1,tag2] \
  [--thumbnail <image-path>] \
  [--playlist "系列名"] \
  [--visibility public|unlisted|private] \
  [--headed | --headless]
```

## 本仓库封装

```powershell
node skills/publish/youtube/scripts/cli.mjs publish `
  --video "$HERMES_ROOT/视频/xxx.mp4" `
  --title "Title" `
  --description "Desc" `
  --privacy unlisted
```

环境变量：

- `SAU_ROOT` — social-auto-upload 路径
- `YOUTUBE_ACCOUNT_ID` — sau 账号名
