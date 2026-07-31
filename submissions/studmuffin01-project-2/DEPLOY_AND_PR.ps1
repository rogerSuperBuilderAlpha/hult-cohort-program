# Run in PowerShell — save, deploy, open PR for Fireside (Project 2)
# From: c:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program

$ErrorActionPreference = "Stop"
cd c:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program

# 1) Branch
git fetch origin 2>$null
git checkout participants/summer26/phase-1-project-2/studmuffin01
# If branch doesn't exist yet:
# git checkout -b participants/summer26/phase-1-project-2/studmuffin01

# 2) Commit (only project-2 files)
git add submissions/studmuffin01-project-2
git status
git commit -m @"
Submit Fireside team collaboration platform for Phase 1 Project 2.

Forth-aligned UI, channels/DMs/groups/threads, flags + AI coach, and hardened localStorage demo flow for reviewers.
"@

# 3) Push to your fork (adjust remote name if needed: origin or fork)
git push -u origin HEAD
# If you use a fork remote:
# git push -u fork HEAD

# 4) Deploy on Vercel
# Option A — CLI (from project folder):
cd submissions/studmuffin01-project-2
# vercel login   # if needed
vercel --prod --yes
# Note the Production URL printed (e.g. https://….vercel.app)

# Option B — Vercel Dashboard:
# New Project → import Studmuffin01/hult-cohort-program
# Root Directory: submissions/studmuffin01-project-2
# Production Branch: participants/summer26/phase-1-project-2/studmuffin01
# Env (optional): NEXT_PUBLIC_FORTH_URL=https://forth-bice.vercel.app

# 5) Edit SUBMISSION_PR.md — replace PASTE_VERCEL_URL with the live URL

# 6) Open PR against upstream project branch
cd c:\Users\raarneaud\Desktop\Ludwitt\hult-cohort-program
gh pr create `
  --repo rogerSuperBuilderAlpha/hult-cohort-program `
  --base projects/summer26/phase-1-project-2 `
  --head Studmuffin01:participants/summer26/phase-1-project-2/studmuffin01 `
  --title "[Project 2] Submission — Studmuffin01" `
  --body-file submissions/studmuffin01-project-2/SUBMISSION_PR.md

# Paste the PR URL + Vercel URL back in chat if you want me to double-check the body.
