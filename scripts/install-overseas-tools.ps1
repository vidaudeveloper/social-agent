# social-agent overseas deps (social-auto-upload + playwright)
# Usage: npm run overseas:install

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
    $parent = Split-Path -Parent $SauRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "[1/6] clone social-auto-upload ..." -ForegroundColor Yellow
    git clone https://github.com/dreammis/social-auto-upload.git $SauRoot
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$confExample = Join-Path $SauRoot "conf.example.py"
$confFile = Join-Path $SauRoot "conf.py"
if ((Test-Path $confExample) -and -not (Test-Path $confFile)) {
    Copy-Item $confExample $confFile
    Write-Host "[hint] created conf.py from conf.example.py" -ForegroundColor Yellow
}
if (Test-Path $confFile) {
    $confText = Get-Content $confFile -Raw
    $confText = $confText -replace 'LOCAL_CHROME_HEADLESS = True', 'LOCAL_CHROME_HEADLESS = False'
    if ($confText -notmatch 'LOCAL_CHROME_PATH = "C:') {
        $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
        if (Test-Path $chrome) {
            $confText = $confText -replace 'LOCAL_CHROME_PATH = ""', "LOCAL_CHROME_PATH = `"$chrome`""
        }
    }
    if ($confText -notmatch 'TK_PROXY') {
        $confText = $confText -replace '(YT_PROXY = None)', "`$1`nTK_PROXY = None  # TikTok; same port as YT_PROXY if needed"
    }
    Set-Content -Path $confFile -Value $confText -Encoding UTF8
}

$DefaultBrowsers = Join-Path $ProfileRoot "tool\sau-playwright-browsers"
if ($env:PLAYWRIGHT_BROWSERS_PATH) { $BrowsersPath = $env:PLAYWRIGHT_BROWSERS_PATH } else { $BrowsersPath = $DefaultBrowsers }
$DownloadHost = if ($env:PLAYWRIGHT_DOWNLOAD_HOST) { $env:PLAYWRIGHT_DOWNLOAD_HOST } else { "https://cdn.npmmirror.com/binaries/playwright" }
New-Item -ItemType Directory -Force -Path $BrowsersPath | Out-Null
$env:PLAYWRIGHT_BROWSERS_PATH = $BrowsersPath
$env:PLAYWRIGHT_DOWNLOAD_HOST = $DownloadHost

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "[error] uv not found. Install: https://docs.astral.sh/uv/" -ForegroundColor Red
    exit 1
}

$verifyScript = Join-Path $ProfileRoot "scripts\verify-sau-tiktok.py"

Push-Location $SauRoot
try {
    if (-not (Test-Path ".venv")) {
        Write-Host "[2/6] uv venv ..." -ForegroundColor Yellow
        uv venv
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }

    Write-Host "[3/6] uv pip install -e . ..." -ForegroundColor Yellow
    uv pip install -e .
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[4/6] uv pip install playwright ..." -ForegroundColor Yellow
    uv pip install "playwright>=1.40"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[5/6] patchright browsers (optional; 抖音优先系统 Chrome) ..." -ForegroundColor Yellow
    $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chrome) {
        Write-Host "[skip] 已检测到系统 Chrome，抖音/TikTok 发布默认用 Chrome，无需下载 patchright chromium" -ForegroundColor Green
        Write-Host "       $chrome"
    } else {
        Write-Host "PLAYWRIGHT_BROWSERS_PATH: $BrowsersPath"
        Write-Host "PLAYWRIGHT_DOWNLOAD_HOST: $DownloadHost"
        uv run patchright install chromium
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[warn] patchright chromium 安装失败（镜像可能无旧版 1208）。请安装 Google Chrome 后重试。" -ForegroundColor Yellow
        }
    }

    Write-Host "[6/6] verify tiktok uploader import ..." -ForegroundColor Yellow
    uv run python $verifyScript
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "[done] overseas tools ready" -ForegroundColor Green
    Write-Host "TikTok: npm run tiktok:login"
    Write-Host "[hint] China: set TK_PROXY in tool/social-auto-upload/conf.py (e.g. http://127.0.0.1:7890)" -ForegroundColor Yellow
    Write-Host "YouTube: skills/publish/youtube/references/sau-runbook.md"
}
finally {
    Pop-Location
}
