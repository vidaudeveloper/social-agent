# social-agent — LinkedIn 依赖安装（gxbvc/linkedin-cli）
# 用法：在 profile 根目录执行  npm run linkedin:setup

$ErrorActionPreference = "Stop"

$ProfileRoot = Split-Path -Parent $PSScriptRoot
$DefaultCliRoot = Join-Path $ProfileRoot "tool\linkedin-cli"
if ($env:LINKEDIN_CLI_ROOT) { $CliRoot = $env:LINKEDIN_CLI_ROOT } else { $CliRoot = $DefaultCliRoot }

$RepoUrl = "https://github.com/gxbvc/linkedin-cli.git"

Write-Host "=== social-agent linkedin:setup ===" -ForegroundColor Cyan
Write-Host "Profile: $ProfileRoot"
Write-Host "LINKEDIN_CLI_ROOT: $CliRoot"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 node，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未找到 npm" -ForegroundColor Red
    exit 1
}

$binLinkedin = Join-Path $CliRoot "bin\linkedin.js"
if (-not (Test-Path $binLinkedin)) {
    $parent = Split-Path -Parent $CliRoot
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Write-Host "[1/3] clone gxbvc/linkedin-cli ..." -ForegroundColor Yellow
    git clone $RepoUrl $CliRoot
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Push-Location $CliRoot
try {
    Write-Host "[2/3] npm install ..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "[3/3] npm run build ..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    if (-not (Test-Path "dist\cli.js")) {
        Write-Host "[错误] 构建失败：未找到 dist\cli.js" -ForegroundColor Red
        exit 1
    }

    $envExample = Join-Path $CliRoot ".env.example"
    $envFile = Join-Path $CliRoot ".env"
    if ((Test-Path $envExample) -and -not (Test-Path $envFile)) {
        Copy-Item $envExample $envFile
        Write-Host '[hint] created tool/linkedin-cli/.env - set LINKEDIN_CLIENT_ID in 项目 .env' -ForegroundColor Yellow
    }

    Write-Host ''
    Write-Host '[done] linkedin-cli ready' -ForegroundColor Green
    Write-Host 'Redirect URL: http://localhost:3457/callback'
    Write-Host 'Login:  npm run linkedin:login'
    Write-Host 'Publish: npm run linkedin:publish'
}
finally {
    Pop-Location
}
