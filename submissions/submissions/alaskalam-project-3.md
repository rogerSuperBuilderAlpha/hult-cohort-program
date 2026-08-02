# Project 3 Submission — @alaskalam
(Summer Pilot 2026, Project 3 — vibe marketing platform).
## Summary
**Vibe Marketing Platform** — a project showcase site for the team to display all the projects they've built, built with Python & Flask.
- Repository: https://github.com/alaskalam/vibemarketinghult
## Production URL
[add your Render URL here, e.g. https://vibemarketinghult.onrender.com]
## PM platform integration notes
It currently does not integrate; future builds will include that. I can see integrating GitHub so projects auto-populate from a team member's repos instead of manual entry, and potentially syncing with Forth so completed milestones automatically create a showcase entry.
## Core features
- **Project gallery** — view all team projects as cards with title, description, link, and image
- **Add a project** — simple form to submit a new project (title, description, link, image URL)
- **Disco ball hover effect** — hovering a project card reveals a spinning, sparkling disco ball above it, built entirely with CSS animations (no image assets)
## Architecture summary
Deployed on Render using Python (Flask), with code hosted on GitHub. Data currently lives in an in-memory list — resets on server restart.
## Agent usage
- **Research:** Built using Claude.
- **Development:** Built using Claude — walked through Flask routes, decorators, and CSS hover/pseudo-element styling.
- **QA:** Honestly didn't get to run any QA tests this time.
## Known limitations
This is a VERY rough draft only; this is not even applying to be voted on, but it is deployed and able to look at. Data is stored in memory only and will reset on server restart or after Render's free tier spins down from inactivity. Future builds will include persistence (Supabase), more form fields, and better design polish.
## Test plan
Things to do in the future
- [x] Add in better UX even a basic color coded style system
- [x] Add in some QA tests + learn what QA tests are best for this kind of app
