# social-agent — 小红书卡片渲染（Auto-Redbook-Skills）
# 用法：npm run tool:install

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultRoot = Join-Path $ProfileRoot "tool\Auto-Redbook-Skills"
if ($env:AUTO_REDBOOK_ROOT) { $RedbookRoot = $env:AUTO_REDBOOK_ROOT } else { $RedbookRoot = $DefaultRoot }

Write-Host "=== social-agent tool:install (xhs-card-render) ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "AUTO_REDBOOK_ROOT: $RedbookRoot"
Write-Host ""

$renderPy = Join-Path $RedbookRoot "scripts\render_xhs.py"
if (-not (Test-Path $renderPy)) {
    $parent = Split-Path -Parent $RedbookRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "[1/5] clone Auto-Redbook-Skills ..." -ForegroundColor Yellow
    git clone https://github.com/comeonzhj/Auto-Redbook-Skills.git $RedbookRoot
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$customThemes = Join-Path $ProfileRoot "assets\xhs-themes"
$targetThemes = Join-Path $RedbookRoot "assets\themes"
if (Test-Path $customThemes) {
    Write-Host "[2/5] sync custom themes from assets/xhs-themes ..." -ForegroundColor Yellow
    if (-not (Test-Path $targetThemes)) { New-Item -ItemType Directory -Path $targetThemes -Force | Out-Null }
    Copy-Item -Path (Join-Path $customThemes "*.css") -Destination $targetThemes -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[2/5] no assets/xhs-themes, skip theme sync" -ForegroundColor DarkGray
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "[error] uv not found. Install: https://docs.astral.sh/uv/" -ForegroundColor Red
    exit 1
}

Push-Location $RedbookRoot
try {
    if (-not (Test-Path ".venv")) {
        Write-Host "[3/5] uv venv ..." -ForegroundColor Yellow
        uv venv
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }

    Write-Host "[4/5] uv pip install -r requirements.txt ..." -ForegroundColor Yellow
    uv pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[5/5] playwright install chromium ..." -ForegroundColor Yellow
    uv run playwright install chromium
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "[done] xhs-card-render ready" -ForegroundColor Green
    Write-Host "  npm run pipeline:xhs -- -Slug your-slug"
    Write-Host "  npm run xhs:card-render -- -File `"<配图.md绝对路径>`""
}
finally {
    Pop-Location
}
