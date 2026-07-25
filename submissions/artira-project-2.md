# # Project 2 Submission — @artira

Summer Pilot 2026, Project 2 — Internal communications platform.

## Summary

Built a real-time communications platform to replace Discord for the cohort. Features live chat with Supabase Realtime, threaded replies, emoji reactions, typing indicators, user presence tracking, and channel management. Dark-first UI with vivid gradients, mobile responsive.

## Production URL

[https://cohort-comms-rho.vercel.app](https://cohort-comms-rho.vercel.app)

Build repo: [https://github.com/artira/cohort-comms](https://github.com/artira/cohort-comms)

Demo login: alex@demo.comms / demo1234

## PM platform integration notes

Not yet integrated. The comms platform runs independently. Future integration could include: webhook notifications in #announcements when tasks are completed, deep links from task comments to chat threads, and shared auth across both platforms via the same Supabase project.

## Agent usage

- Research: Claude ([claude.ai](http://claude.ai)) — reviewed project requirements, identified real-time messaging architecture with Supabase Realtime, scoped channel types and threading model

- Dev: Claude built the full Next.js + Supabase app including auth with presence tracking, real-time messaging with Supabase subscriptions, threaded replies, emoji reactions, typing indicators, channel CRUD, member panel with online/away/offline grouping, dark-themed UI with animations, mobile responsive sidebar, and seed script for demo data

- QA: Build verified locally (npm run build clean), manual smoke test (signup, send messages, reactions, threads, typing indicators, channel creation, mobile nav), deployed to Vercel

## Test plan

- [x] `npm run build` passes

- [x] Sign up and send messages in real-time

- [x] Emoji reactions add/remove correctly

- [x] Thread replies appear in side panel

- [x] Typing indicators show and disappear

- [x] Channel creation works

- [x] Members panel shows online/away/offline

- [x] Mobile responsive (hamburger nav)

- [x] Production deploy working at [https://cohort-comms-rho.vercel.app](https://cohort-comms-rho.vercel.app)