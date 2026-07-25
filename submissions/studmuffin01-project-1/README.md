# INITIARA

**The Gateway to Project Success**

Initiara is a web-based initiative tracking and engagement platform designed to help users create, manage, and monitor personal and cohort-based initiatives. The application combines progress tracking, accountability, peer recognition, and motivational features to encourage sustained participation and goal completion.

## Overview

Initiara provides a centralized space for users to:

- Start and manage initiatives
- Monitor personal progress
- View cohort performance
- Track action items
- Recognize high performers
- Encourage peer participation through motivation-focused features

The platform is designed around visibility, accountability, and engagement, helping users stay focused on their goals while fostering participation within a larger cohort community.

---

## Features

### Initiative Management

- Create new initiatives
- View initiative details
- Track initiative progress
- Access initiative-specific information

### Personal Progress Tracking

- Monitor individual status and performance
- Review personal initiative progress
- Stay aligned with goals and commitments

### Cohort Visibility

- View overall cohort status
- Compare progress across participants
- Promote transparency and accountability

### Action Planning

- Review action items
- Focus on next steps
- Support execution and follow-through

### Engagement & Motivation

- Motivate fellow participants
- Recognize top performers
- Highlight top motivators
- Encourage positive peer engagement

---

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Development Tools

- ESLint
- PostCSS

### Backend & Auth

- Supabase (PostgreSQL + Auth)
- Per-user persistence when signed in
- Email signup with confirmation

### Deployment

- Vercel — see [DEPLOY.md](./DEPLOY.md) for env vars and Supabase URL configuration

---

## Application Structure

```text
app/
├── globals.css
├── layout.tsx
├── page.tsx
│
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/route.ts
│
├── action-items/
│   └── page.tsx
│
├── cohorts-status/
│   └── page.tsx
│
├── initiatives/
│   └── [slug]/
│       ├── page.tsx
│       └── not-found.tsx
│
├── motivate-a-friend/
│   └── page.tsx
│
├── my-status/
│   └── page.tsx
│
├── start-new-initiative/
│   └── page.tsx
│
├── top-ten-motivators/
│   └── page.tsx
│
└── top-ten-performers/
    └── page.tsx
```

---

## Available Routes

| Route | Description |
|---------|------------|
| `/` | Main dashboard (Executive Summary + task tables) |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/start-new-initiative` | Create a new initiative |
| `/initiatives/[slug]` | View initiative details |
| `/my-status` | Personal progress dashboard |
| `/cohorts-status` | Cohort performance overview |
| `/action-items` | Action item management |
| `/motivate-a-friend` | Peer encouragement and engagement |
| `/top-ten-performers` | Top performer leaderboard |
| `/top-ten-motivators` | Top motivator leaderboard |

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/Studmuffin01/initiara.git
cd initiara
```

### Install Dependencies

```bash
npm install
```

### Environment variables

```bash
cp .env.example .env.local
```

Fill in Supabase values (see [DEPLOY.md](./DEPLOY.md)), then run the SQL in `supabase/schema.sql` in your Supabase project.

---

## Running the Application

### Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

---

## Fresh Clone Verification

The application setup was verified using a fresh repository clone.

Commands executed

```bash
git clone https://github.com/Studmuffin01/initiara.git
cd initiara
npm install
```

Results:

- Repository cloned successfully.
- Dependencies installed successfully.
- No blocking installation issues encountered.

Note: Production builds may encounter certificate-related issues in environments that restrict external font downloads from Google Fonts.

---

## Authentication & persistence

- **Sign up** at `/auth/signup` — confirmation email required (see [DEPLOY.md](./DEPLOY.md) for redirect URLs).
- **Sign in** at `/auth/login` — redirects to `/` after success.
- **Sign out** — header button on all main pages when authenticated.
- **Logged in:** initiatives, tasks, and cohort data sync to Supabase (per user).
- **Logged out:** same features use browser `localStorage` only.

Task tables use status values **To Do**, **In Progress**, and **Done**, with an **Assignee** column (free text until member roster is added in Phase B).

---

## Design Philosophy

Initiara was built around several key principles:

### Visibility

Users should be able to quickly understand progress, status, and priorities.

### Accountability

Making progress visible encourages follow-through and commitment.

### Recognition

Highlighting top performers and top motivators reinforces positive behaviors.

### Community Engagement

Motivation and peer support features encourage participants to actively support one another.

### Simplicity

Information is organized into focused sections so users can quickly access what they need without unnecessary complexity.

---

## Known Limitations

- Assignee is free text; no team member roster or assignee filter yet (Phase B).
- No initiative archive or inline title edit yet (Phase B).
- Data is per authenticated user, not a shared cohort workspace.
- Sidebar routes (`/my-status`, `/action-items`, etc.) are placeholders.
- Limited automated testing coverage.
- Production builds may be affected by environments that block font CDN downloads.

---

## Future Enhancements

- Team members + assignee picker
- Task filters (status, assignee, project)
- Initiative archive and title edit
- Shared cohort workspace
- Expanded leaderboard and collaboration features

---

## Deployment

The application is deployed on Vercel. Configure Supabase env vars and auth redirect URLs using [DEPLOY.md](./DEPLOY.md).

**Production URL:**

https://initiara-git-participants-summer26phase-1-project-b9933f-rawle.vercel.app

---

## Author

**Rawle Arneaud**

Project Submission for the Hult Cohort Program.