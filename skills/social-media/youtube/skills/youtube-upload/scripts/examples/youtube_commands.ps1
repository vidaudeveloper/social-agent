# 账号 default；按需改 $account
$account = "default"
$env:SAU_ROOT = "$PSScriptRoot\..\..\..\..\tool\social-auto-upload"

uv run --directory $env:SAU_ROOT sau youtube login --account $account --headed
uv run --directory $env:SAU_ROOT sau youtube check --account $account
uv run --directory $env:SAU_ROOT sau youtube upload-video `
  --account $account `
  --file "$HERMES_ROOT/视频/example.mp4" `
  --title "Example Title" `
  --visibility unlisted
