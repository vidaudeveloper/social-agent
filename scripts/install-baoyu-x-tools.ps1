# baoyu-post-to-x 依赖（JimLiu/baoyu-skills）
# Usage: npm run x:setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultRoot = Join-Path $ProfileRoot "tool\baoyu-skills"
if ($env:BAOYU_SKILLS_ROOT) { $BaoyuRoot = $env:BAOYU_SKILLS_ROOT } else { $BaoyuRoot = $DefaultRoot }

$RepoUrlHttps = "https://github.com/JimLiu/baoyu-skills.git"
$RepoUrlSsh = "git@github.com:JimLiu/baoyu-skills.git"
$Marker = Join-Path $BaoyuRoot "skills\baoyu-post-to-x\scripts\x-browser.ts"
$VendorRoot = Join-Path (Split-Path -Parent $BaoyuRoot) "baoyu-skills-vendor"
$VendorMarker = Join-Path $VendorRoot "skills\baoyu-post-to-x\scripts\x-browser.ts"

function Test-BaoyuMarker([string]$Root) {
    return Test-Path (Join-Path $Root "skills\baoyu-post-to-x\scripts\x-browser.ts")
}

function Clone-BaoyuSkills([string]$TargetRoot) {
    $parent = Split-Path -Parent $TargetRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "  clone -> $TargetRoot" -ForegroundColor DarkGray
    git clone --depth 1 $RepoUrlHttps $TargetRoot
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  HTTPS 失败，改用 SSH ..." -ForegroundColor Yellow
        git clone --depth 1 $RepoUrlSsh $TargetRoot
    }
    return $LASTEXITCODE
}

Write-Host "=== social-agent x:setup (baoyu-post-to-x) ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "BAOYU_SKILLS_ROOT: $BaoyuRoot"
Write-Host ""

if (-not (Test-BaoyuMarker $BaoyuRoot)) {
    if (Test-Path $BaoyuRoot) {
        Write-Host "[1/2] 检测到不完整目录 $BaoyuRoot，改用 vendor 路径" -ForegroundColor Yellow
        $BaoyuRoot = $VendorRoot
        $env:BAOYU_SKILLS_ROOT = $BaoyuRoot
        $Marker = Join-Path $BaoyuRoot "skills\baoyu-post-to-x\scripts\x-browser.ts"
    }
    if (-not (Test-BaoyuMarker $BaoyuRoot)) {
        Write-Host "[1/2] clone baoyu-skills ..." -ForegroundColor Yellow
        Clone-BaoyuSkills $BaoyuRoot | Out-Null
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
} else {
    Write-Host "[1/2] baoyu-skills already cloned" -ForegroundColor DarkGray
}

Write-Host "[2/2] verify bun (via npx if needed) ..." -ForegroundColor Yellow
npx -y bun --version | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[done] baoyu-post-to-x ready" -ForegroundColor Green
Write-Host "BAOYU_SKILLS_ROOT: $BaoyuRoot"
Write-Host "Login:  npm run x:login"
Write-Host "Draft:  npm run x:publish -- --text `"Hello test`""
Write-Host "Profile: $env:APPDATA\baoyu-skills\chrome-profile"
