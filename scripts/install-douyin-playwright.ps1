# Playwright 浏览器（PVA 抖音发布依赖）
# Usage: npm run douyin:setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultBrowsers = Join-Path $ProfileRoot "tool\playwright-browsers"
if ($env:PLAYWRIGHT_BROWSERS_PATH) {
    $BrowsersPath = $env:PLAYWRIGHT_BROWSERS_PATH
} elseif ($env:PLAYWRIGHT_BROWSERS_ROOT) {
    $BrowsersPath = $env:PLAYWRIGHT_BROWSERS_ROOT
} else {
    $BrowsersPath = $DefaultBrowsers
}
$DownloadHost = if ($env:PLAYWRIGHT_DOWNLOAD_HOST) { $env:PLAYWRIGHT_DOWNLOAD_HOST } else { "https://cdn.npmmirror.com/binaries/playwright" }

Write-Host "=== douyin:setup (Playwright for PVA) ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "PLAYWRIGHT_BROWSERS_PATH: $BrowsersPath"
Write-Host "PLAYWRIGHT_DOWNLOAD_HOST: $DownloadHost"
Write-Host ""

New-Item -ItemType Directory -Force -Path $BrowsersPath | Out-Null

$env:PLAYWRIGHT_BROWSERS_PATH = $BrowsersPath
$env:PLAYWRIGHT_DOWNLOAD_HOST = $DownloadHost

Write-Host "Installing playwright@1.61.1 chromium (npmmirror) ..." -ForegroundColor Yellow
npx playwright@1.61.1 install chromium
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[done] Playwright ready at $BrowsersPath" -ForegroundColor Green
Write-Host "Next: npm run douyin:login"
