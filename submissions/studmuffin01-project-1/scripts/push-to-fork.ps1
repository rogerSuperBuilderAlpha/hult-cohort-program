# Push INITIARA submission to fork, commit, and open PR.
# Run from PowerShell:
#   cd submissions\studmuffin01-project-1
#   .\scripts\push-to-fork.ps1

$ErrorActionPreference = "Stop"

$ForkUrl = "https://github.com/Studmuffin01/hult-cohort-program.git"
$BranchName = "participants/summer26/phase-1-project-1/studmuffin01"
$SubmissionPath = "submissions/studmuffin01-project-1"

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
git reset HEAD -- "$SubmissionPath/.env.local" 2>$null
git reset HEAD -- "$SubmissionPath/_commit_pr_report.txt" 2>$null
git reset HEAD -- "$SubmissionPath/git-status.txt" 2>$null
git reset HEAD -- "$SubmissionPath/shell-test.txt" 2>$null
git reset HEAD -- "$SubmissionPath/ci-output.txt" 2>$null
git reset HEAD -- "$SubmissionPath/test-out.txt" 2>$null

Write-Host "`n--- Status ---" -ForegroundColor Yellow
git status -sb

$porcelain = git status --porcelain -- $SubmissionPath
if ($porcelain) {
  git commit -m "Complete Phase B rubric: team members, assignee picker, task filters, initiative edit/archive." -m "Supabase auth polish, mobile Command Center, Vitest tests, REVIEWER_RUBRIC.md, and UX polish for INITIARA submission."
  Write-Host "Created commit." -ForegroundColor Green
} else {
  Write-Host "Nothing new to commit." -ForegroundColor DarkYellow
}

Write-Host "`n--- Push to fork ---" -ForegroundColor Yellow
Write-Host "Branch: $BranchName"
Write-Host "Remote: fork ($ForkUrl)"
git push -u fork $BranchName

Write-Host "`n--- Pull request ---" -ForegroundColor Yellow
$prBodyFile = Join-Path $env:TEMP "initiara-pr-body.md"
@"
## Summary
- Phase B rubric completion: team members roster, assignee picker, task filters, initiative edit/archive
- Supabase auth and per-user persistence; Command Center sidebar, AI Assistant, motivation tools
- Mobile Command Center drawer in page header, dark mode contrast, and UX polish
- Vitest coverage (health/overdue, API 401 guards, parsers) and [REVIEWER_RUBRIC.md]($SubmissionPath/REVIEWER_RUBRIC.md) for reviewers

## Test plan
- [ ] Map deliverables to REVIEWER_RUBRIC.md (9/9 rubric items)
- [ ] ``cd $SubmissionPath && npm test``
- [ ] ``npm run lint``
- [ ] ``npm run build``
- [ ] Sign in on production, create initiative, add team member, assign task, filter, archive
"@ | Set-Content -Path $prBodyFile -Encoding utf8

$existingPr = gh pr view --json url --jq .url 2>$null
if ($existingPr) {
  Write-Host "PR already exists: $existingPr" -ForegroundColor Cyan
} else {
  $prUrl = gh pr create --title "studmuffin01 Project 1: Phase B rubric completion" --body-file $prBodyFile 2>&1
  Write-Host $prUrl -ForegroundColor Green
}

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Submission: https://github.com/Studmuffin01/hult-cohort-program/tree/$($BranchName -replace '/','%2F')/$SubmissionPath"
