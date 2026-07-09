# 清理已废弃的本地/全局工具（PVA、signal-fire）
# Usage: npm run tool:cleanup-legacy

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$ToolRoot = Join-Path $ProfileRoot "tool"

$LegacyDirs = @(
    (Join-Path $ToolRoot "playwright-browsers"),  # 抖音 PVA 专用 Chromium（~600MB+）
    (Join-Path $ToolRoot "signal-fire")             # 已废弃 X PoC，改用 baoyu-post-to-x
)

Write-Host "=== social-agent tool:cleanup-legacy ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host ""

foreach ($dir in $LegacyDirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "[skip] not found: $dir" -ForegroundColor DarkGray
        continue
    }
    $sizeMb = [math]::Round(
        ((Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB),
        1
    )
    Write-Host "[remove] $dir ($sizeMb MB) ..." -ForegroundColor Yellow
    Remove-Item -LiteralPath $dir -Recurse -Force
    Write-Host "  done" -ForegroundColor Green
}

Write-Host ""
Write-Host "[npm] uninstall global @panda-video-automation/pva (if installed) ..." -ForegroundColor Yellow
npm uninstall -g @panda-video-automation/pva 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  global PVA removed" -ForegroundColor Green
} else {
    Write-Host "  global PVA not installed or already removed" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[done] legacy cleanup finished" -ForegroundColor Green
Write-Host "保留: tool/social-auto-upload, tool/baoyu-skills*, tool/linkedin-cli, tool/sau-playwright-browsers"
Write-Host "X login: npm run x:setup; npm run x:login"
Write-Host "Douyin: npm run overseas:install; npm run douyin:login"
