# Push INITIARA submission to your GitHub fork (no upstream main access required).
# Run from PowerShell:
#   cd submissions\studmuffin01-project-1
#   .\scripts\push-to-fork.ps1

$ErrorActionPreference = "Stop"

$ForkUrl = "https://github.com/Studmuffin01/hult-cohort-program.git"
$BranchName = "participants/summer26/phase-1-project-1/studmuffin01"
$SubmissionPath = "submissions/studmuffin01-project-1"

# Repo root = hult-cohort-program (three levels up from scripts/)
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
Set-Location $RepoRoot

Write-Host "Repo root: $RepoRoot" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $RepoRoot ".git"))) {
  Write-Error "Not a git repository. Expected .git at $RepoRoot"
}

Write-Host "`n--- Remotes ---" -ForegroundColor Yellow
git remote -v

$forkRemote = git remote | Select-String -Pattern "^fork$" -Quiet
if (-not $forkRemote) {
  Write-Host "Adding remote 'fork' -> $ForkUrl" -ForegroundColor Green
  git remote add fork $ForkUrl
} else {
  $currentForkUrl = git remote get-url fork
  if ($currentForkUrl -ne $ForkUrl) {
    Write-Host "Updating remote 'fork' URL to $ForkUrl" -ForegroundColor Green
    git remote set-url fork $ForkUrl
  }
}

Write-Host "`n--- Branch ---" -ForegroundColor Yellow
$existingBranch = git branch --list $BranchName
if ($existingBranch) {
  git checkout $BranchName
} else {
  git checkout -b $BranchName
}

Write-Host "`n--- Stage submission ( .env.local is gitignored ) ---" -ForegroundColor Yellow
git add $SubmissionPath

Write-Host "`n--- Status ---" -ForegroundColor Yellow
git status -sb

$porcelain = git status --porcelain
if ($porcelain) {
  $commitMessage = @"
INITIARA: Supabase auth, server persistence, and Phase A docs

- Email auth with confirmation flow
- Per-user Supabase sync for initiatives, tasks, cohort data
- Assignee column label, AGENTS.md, DEPLOY.md, README updates
"@
  git commit -m $commitMessage
  Write-Host "Created commit." -ForegroundColor Green
} else {
  Write-Host "Nothing new to commit." -ForegroundColor DarkYellow
}

Write-Host "`n--- Push to fork ---" -ForegroundColor Yellow
Write-Host "Branch: $BranchName"
Write-Host "Remote: fork ($ForkUrl)"
git push -u fork $BranchName

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Open https://github.com/Studmuffin01/hult-cohort-program/tree/$($BranchName -replace '/','%2F')/$SubmissionPath"
Write-Host "  2. Vercel: import Studmuffin01/hult-cohort-program, branch $BranchName, root $SubmissionPath"
Write-Host "  3. When ready: open a PR from your fork branch to the cohort upstream repo"
