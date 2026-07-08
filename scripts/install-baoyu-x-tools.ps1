# baoyu-post-to-x dependency (JimLiu/baoyu-skills)
# Usage: npm run x:setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultRoot = Join-Path $ProfileRoot "tool\baoyu-skills"
if ($env:BAOYU_SKILLS_ROOT) { $BaoyuRoot = $env:BAOYU_SKILLS_ROOT } else { $BaoyuRoot = $DefaultRoot }

$RepoUrlHttps = "https://github.com/JimLiu/baoyu-skills.git"
$RepoUrlSsh = "git@github.com:JimLiu/baoyu-skills.git"
$VendorRoot = Join-Path (Split-Path -Parent $BaoyuRoot) "baoyu-skills-vendor"

function Test-BaoyuMarker([string]$Root) {
    return Test-Path (Join-Path $Root "skills\baoyu-post-to-x\scripts\x-browser.ts")
}

function Clone-BaoyuSkills([string]$TargetRoot) {
    $parent = Split-Path -Parent $TargetRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "  clone -> $TargetRoot" -ForegroundColor DarkGray
    git clone --depth 1 $RepoUrlHttps $TargetRoot
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  HTTPS failed, trying SSH ..." -ForegroundColor Yellow
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
        Write-Host "[1/2] Incomplete clone detected, using vendor path" -ForegroundColor Yellow
        $BaoyuRoot = $VendorRoot
        $env:BAOYU_SKILLS_ROOT = $BaoyuRoot
    }
    if (-not (Test-BaoyuMarker $BaoyuRoot)) {
        Write-Host "[1/3] clone baoyu-skills ..." -ForegroundColor Yellow
        Clone-BaoyuSkills $BaoyuRoot | Out-Null
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
} else {
    Write-Host "[1/3] baoyu-skills already cloned" -ForegroundColor DarkGray
}

function Apply-BaoyuKeepBrowserPatch([string]$Root) {
    $targets = @(
        "skills\baoyu-post-to-x\scripts\x-browser.ts",
        "skills\baoyu-post-to-x\scripts\x-video.ts"
    )
    $needle = 'let leaveChromeOpen = !submit;'
    $patch = @'
    /* SOCIAL_AGENT_KEEP_BROWSER_PATCH: default keep Chrome open to reduce automation fingerprint */
    const keepBrowserOpen = process.env.X_CLOSE_BROWSER !== 'true';
    let leaveChromeOpen = keepBrowserOpen || !submit;
'@
    foreach ($rel in $targets) {
        $path = Join-Path $Root $rel
        if (-not (Test-Path $path)) { continue }
        $content = Get-Content $path -Raw -Encoding UTF8
        if ($content -match 'SOCIAL_AGENT_KEEP_BROWSER_PATCH') { continue }
        if ($content -notmatch [regex]::Escape($needle)) { continue }
        $newContent = $content.Replace($needle, $patch.TrimEnd())
        Set-Content -Path $path -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "  patched keep-browser: $rel" -ForegroundColor DarkGray
    }
}

Write-Host "[2/3] apply keep-browser patch ..." -ForegroundColor Yellow
Apply-BaoyuKeepBrowserPatch $BaoyuRoot

Write-Host "[3/3] verify bun (via npx if needed) ..." -ForegroundColor Yellow
npx -y bun --version | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$ProfileDir = Join-Path $env:APPDATA "baoyu-skills\chrome-profile"
Write-Host ""
Write-Host "[done] baoyu-post-to-x ready" -ForegroundColor Green
Write-Host "BAOYU_SKILLS_ROOT: $BaoyuRoot"
Write-Host "Login:  npm run x:login"
Write-Host 'Draft:  npm run x:publish -- --text "Hello test"'
Write-Host "Profile: $ProfileDir"
