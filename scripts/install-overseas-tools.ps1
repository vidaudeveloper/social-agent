# social-agent — 海外平台依赖安装（social-auto-upload + playwright）
# 用法：在 profile 根目录执行  npm run overseas:install

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultSauRoot = Join-Path $ProfileRoot "tool\social-auto-upload"
if ($env:SAU_ROOT) { $SauRoot = $env:SAU_ROOT } else { $SauRoot = $DefaultSauRoot }

Write-Host "=== social-agent overseas:install ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "SAU_ROOT: $SauRoot"
Write-Host ""

$sauCli = Join-Path $SauRoot "sau_cli.py"
if (-not (Test-Path $sauCli)) {
    Write-Host "[错误] social-auto-upload 未找到: $SauRoot" -ForegroundColor Red
    Write-Host "请先 clone 到该目录，或设置环境变量 SAU_ROOT 指向已有副本。"
    Write-Host "  git clone https://github.com/dreammis/social-auto-upload.git `"$SauRoot`""
    exit 1
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 uv，请先安装: https://docs.astral.sh/uv/" -ForegroundColor Red
    exit 1
}

Push-Location $SauRoot
try {
    Write-Host "[1/4] uv pip install -e . ..." -ForegroundColor Yellow
    uv pip install -e .
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[2/4] uv pip install playwright (TikTok tk_uploader) ..." -ForegroundColor Yellow
    uv pip install "playwright>=1.40"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[3/4] uv run playwright install chromium ..." -ForegroundColor Yellow
    uv run playwright install chromium
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[4/4] 验证 import ..." -ForegroundColor Yellow
    uv run python -c "import playwright; from uploader.tk_uploader.main_chrome import tiktok_setup; print('ok: playwright + tk_uploader')"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "[完成] 海外工具已就绪。" -ForegroundColor Green
    Write-Host "TikTok 登录: npm run tiktok:login"
    Write-Host "YouTube 登录: 见 skills/social-media/youtube/references/sau-runbook.md"
}
finally {
    Pop-Location
}
