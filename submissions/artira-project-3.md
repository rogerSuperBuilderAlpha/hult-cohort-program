# Project 3 Submission — @artira

Summer Pilot 2026, Project 3 — Public-facing cohort showcase.

## Summary

Built a public-facing showcase connecting the cohort's three platforms into one ecosystem visible to hiring partners. Reads live PM data, displays student profiles with skill filtering, and includes a partner hiring portal with intro request forms and event RSVP.

## Production URL

https://cohort-showcase-pearl.vercel.app

Build repo: https://github.com/artira/cohort-showcase

## Sample profile URLs

- All students: https://cohort-showcase-pearl.vercel.app/students
- Interactive explorer: https://cohort-showcase-pearl.vercel.app/explore
- Projects with live PM data: https://cohort-showcase-pearl.vercel.app/projects
- Partner portal: https://cohort-showcase-pearl.vercel.app/partners

## Vibe / positioning notes

The site is aimed at hiring partners evaluating cohort talent. The feeling: professional credibility backed by radical transparency. The headline "Don't trust our word — inspect their GitHub" sets the tone. Every claim links to a live deployment, a GitHub repo, or a public PR. A hiring partner should think within 10 seconds: "These people actually built production software, and I can verify every piece of it myself." The hero stats pull live from the PM platform. The partner portal is direct: fee model, intro request form, showcase event RSVP. No friction, no gatekeeping.

## Partner-facing README

This site is the public face of the Hult Cohort Developer Program, Summer 2026. Browse student profiles at /students, filter by skill. Review deployed projects at /projects with live PM data. See the ecosystem at /explore with interactive skills map, timeline, and leaderboard. Request introductions at /partners. Fee model: 25% of first-year base salary on successful hire. 90-day clawback. 10% kickback to candidate. No upfront cost.

## PM platform integration notes

The showcase reads live data from the PM platform's Supabase database. Homepage displays real-time stats. Projects page shows per-project progress bars pulled directly from PM Supabase. Explore page shows live leaderboard from PM.

## Agent usage

- Research: Claude (claude.ai) — reviewed Project 3 requirements, rubric, hiring partner docs
- Dev: Claude built the full showcase including homepage with PM stats, student profiles with skill filtering, interactive explore page (skills bubbles, timeline, leaderboard, ecosystem viz), projects page with live PM data, partner portal with intro request form and event RSVP, SEO meta tags, responsive design
- QA: Build verified locally, manual smoke test, deployed to Vercel
