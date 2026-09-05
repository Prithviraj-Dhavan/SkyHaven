<#
.SYNOPSIS
    Restore SkyHaven to Original Monorepo Structure (Client + Server)
.DESCRIPTION
    Removes the commit plan scripts and backend/frontend directories,
    leaving your original clean project with SkyHaven branding intact.
#>

$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESTORING ORIGINAL CLEAN SKYHAVEN MONOREPO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Remove commit plan scripts
$scriptsToRemove = @(
    "commit_plan.ps1",
    "commit_plan.sh",
    "day1_commits.ps1",
    "day2_commits.ps1",
    "day3_commits.ps1",
    "push_first_commit.ps1",
    "reset_and_clean.ps1"
)

foreach ($s in $scriptsToRemove) {
    $p = Join-Path $WorkspaceRoot $s
    if (Test-Path $p) {
        Remove-Item -Force $p
        Write-Host "  [-] Removed script: $s" -ForegroundColor Gray
    }
}

# 2. Remove backend/ and frontend/ folders (original code is safely in server/ and client/)
$foldersToRemove = @("backend", "frontend")
foreach ($f in $foldersToRemove) {
    $p = Join-Path $WorkspaceRoot $f
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p
        Write-Host "  [-] Removed folder: $f" -ForegroundColor Gray
    }
}

# 3. Clean and initialize fresh Git
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

git init -b main | Out-Null
git config user.name "Prithviraj"
git config user.email "developer@skyhaven.internal"
git remote add origin https://github.com/Prithviraj-Dhavan/SkyHaven.git

# 4. Stage entire original project
git add .
git commit -m "feat: complete SkyHaven flight reservation platform" | Out-Null

Write-Host "`n[+] Pushing original clean SkyHaven codebase to GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Original codebase restored & pushed to GitHub." -ForegroundColor Green
Write-Host "  Folders: client/ and server/ (Original structure)" -ForegroundColor Yellow
Write-Host "  Repository: https://github.com/Prithviraj-Dhavan/SkyHaven" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green

# Remove this cleanup script itself
Remove-Item -Force $MyInvocation.MyCommand.Path -ErrorAction SilentlyContinue
