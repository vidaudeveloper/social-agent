# social-agent — YouTube Analytics 依赖安装（Bin-Huang/youtube-analytics-cli）
# 用法：在 profile 根目录执行  npm run youtube:stats-setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultCliRoot = Join-Path $ProfileRoot "tool\youtube-analytics-cli"
if ($env:YOUTUBE_ANALYTICS_CLI_ROOT) {
    $CliRoot = $env:YOUTUBE_ANALYTICS_CLI_ROOT
} else {
    $CliRoot = $DefaultCliRoot
}

Write-Host "=== social-agent youtube:stats-setup ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "YOUTUBE_ANALYTICS_CLI_ROOT: $CliRoot"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 node，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 npm" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $CliRoot)) {
    New-Item -ItemType Directory -Path $CliRoot -Force | Out-Null
}

$pkgJson = Join-Path $CliRoot "package.json"
if (-not (Test-Path $pkgJson)) {
    Set-Content -Path $pkgJson -Encoding utf8 -Value (@'
{
  "name": "youtube-analytics-cli-local",
  "private": true,
  "description": "Local install of youtube-analytics-cli for social-agent"
}
'@)
}

Push-Location $CliRoot
try {
    Write-Host "[1/2] npm install youtube-analytics-cli ..." -ForegroundColor Yellow
    npm install youtube-analytics-cli@1.0.3
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $entry = Join-Path $CliRoot "node_modules\youtube-analytics-cli\dist\index.js"
    if (-not (Test-Path $entry)) {
        Write-Host "[错误] 安装失败：未找到 dist\index.js" -ForegroundColor Red
        exit 1
    }

    Write-Host "[2/2] smoke --help ..." -ForegroundColor Yellow
    node $entry --help
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ''
    Write-Host '[done] youtube-analytics-cli ready' -ForegroundColor Green
    Write-Host '公开数据: 在 Hermes/.env 配置 YOUTUBE_API_KEY'
    Write-Host 'Analytics 报表: 另需 YOUTUBE_CLIENT_ID / SECRET / REFRESH_TOKEN'
    Write-Host '试跑:  npm run youtube:stats -- videos dQw4w9WgXcQ'
    Write-Host '文档: skills/analytics/youtube/references/setup.md'
}
finally {
    Pop-Location
}
