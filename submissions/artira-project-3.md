# Project 3 Submission — @artira

Summer Pilot 2026, Project 3 — Public-facing cohort showcase.

## Summary

Built a public-facing showcase connecting the cohort's three platforms: PM, Comms, and this showcase. Features student profiles with skill filters, live project status from the PM platform, partner hiring portal with intro request form, event RSVP, and SEO. No login required for public pages.

## Production URL

https://cohort-showcase-anb5ijbu1-artiras-projects.vercel.app

Build repo: https://github.com/artira/cohort-showcase

## PM platform integration notes

The showcase reads live data from the PM platform's Supabase database. The homepage displays real-time stats (projects, tasks, completion rate), and the Projects page shows per-project progress bars with task breakdowns pulled directly from PM Supabase. The Ecosystem section links PM, Comms, and Showcase with live status indicators.

## Agent usage

- Research: Claude (claude.ai) — reviewed Project 3 requirements, rubric, hiring partner docs, scoped PM integration approach
- Dev: Claude built the full showcase including homepage with PM stats integration, student profiles with skill filtering, projects page with live PM data, partner portal with intro request form and event RSVP, shared navigation, SEO meta tags, and responsive design
- QA: Build verified locally, manual smoke test (homepage stats, student profiles, skill filter, partner form, projects page), deployed to Vercel
