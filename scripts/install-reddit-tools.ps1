# social-agent — Reddit 依赖安装（reddit-skills）
# 用法：在 profile 根目录执行  npm run reddit:setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultRedditRoot = Join-Path $ProfileRoot "tool\reddit-skills"
if ($env:REDDIT_ROOT) { $RedditRoot = $env:REDDIT_ROOT } else { $RedditRoot = $DefaultRedditRoot }

Write-Host "=== social-agent reddit:setup ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "REDDIT_ROOT: $RedditRoot"
Write-Host ""

$redditCli = Join-Path $RedditRoot "scripts\cli.py"
if (-not (Test-Path $redditCli)) {
    $parent = Split-Path -Parent $RedditRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "[1/3] clone reddit-skills ..." -ForegroundColor Yellow
    git clone https://github.com/1146345502/reddit-skills.git $RedditRoot
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 uv，请先安装: https://docs.astral.sh/uv/" -ForegroundColor Red
    exit 1
}

Push-Location $RedditRoot
try {
    Write-Host "[2/3] uv sync ..." -ForegroundColor Yellow
    if (Test-Path "pyproject.toml") {
        uv sync
    } else {
        uv pip install -r requirements.txt 2>$null
        if (-not $?) { uv pip install websockets requests }
    }
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[3/3] Chrome 扩展安装提示" -ForegroundColor Yellow
    $extPath = Join-Path $RedditRoot "extension"
    Write-Host "  1. 打开 chrome://extensions/"
    Write-Host "  2. 开启开发者模式，加载已解压: $extPath"
    Write-Host "  3. Reddit 网页界面语言设为 English（设置 → Display language）"
    Write-Host "  4. 桥接默认: ws://localhost:9334"
    Write-Host ""
    Write-Host "[完成] reddit-skills 已就绪。验证: npm run reddit:check-login" -ForegroundColor Green
}
finally {
    Pop-Location
}
