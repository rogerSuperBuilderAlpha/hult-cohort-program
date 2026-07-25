# Project 1 Submission — @SuperCUDA

MergeBoard, a cohort leaderboard that makes shipping the score: merged PRs rank first, and every submission earns two quality ratings — a two-stage LLM review (whole-codebase static pass, then a browser agent that live-verifies the deployed app against its own README) and 0–5 peer votes, with the peer average becoming the default rating once a submission clears 10 votes.

Repo: https://github.com/SuperCUDA/mergeboard
Production URL: https://mergeboard.vercel.app

Next.js 16 (App Router) on Vercel + Firebase (GitHub sign-in, Firestore behind Admin-SDK-only API routes) + z-ai/glm-5.2 on NVIDIA NIM as the review engine. Full write-up in the PR description.
