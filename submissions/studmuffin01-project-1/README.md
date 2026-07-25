# INITIARA

**The Gateway to Project Success**

A cohort progress dashboard built with Next.js and Tailwind CSS. INITIARA tracks six weekly initiatives, summarizes cohort submission rates, and provides detailed per-participant tracking tables — with all progress saved locally in your browser.

---

## Project Overview

INITIARA is a single-page executive dashboard for monitoring initiative health across a 67-person cohort. The app is divided into two main sections:

1. **Executive Summary** — A high-level table showing all six initiatives with cohort submission percentage, deadline, and overall health indicator.
2. **Initiative Summary** — Six detailed tracking tables (one per initiative) with 67 rows each for cohort member submissions.

There is no server or database. Cohort checkbox progress is stored in your browser's **localStorage**, so data persists between visits until you clear site data.

---

## Features

### Executive Summary

- **Initiative links** — Click any initiative to scroll to its detailed table below
- **Cohort Submissions** — Live percentage based on rows with at least one checkbox ticked (out of 67)
- **Deadline** — Placeholder dates per initiative (currently `TBD`)
- **Overall Health** — Color-coded indicator (green / yellow / red) derived from cohort submission progress

### Initiative Summary

- **Six initiative tables** — Week 1 through Week 6 curriculum tracks
- **67 rows per table** — One row per cohort member slot
- **Submission tracking** — Toggle checkboxes for:
  - Pull Request Merged
  - 1st Review Submitted
  - 2nd Review Submitted
  - 1st Vote Submitted
  - 2nd Vote Submitted
- **Row status** — Auto-calculated percentage per row (0%, 20%, 40%, 60%, 80%, 100%)
- **Gamification** — Row background colors change by status tier; 100% rows show a trophy
- **Status legend** — Colour key displayed below the section heading

### General

- **Dark mode** — Toggle in the header; preference saved to localStorage
- **Go To navigation** — Jump to the top of the page or any initiative table
- **Responsive design** — Works on mobile, tablet, and desktop
- **Placeholder initiative pages** — Routes at `/initiatives/[slug]` for future detail views

---

## The Six Initiatives

| Week | Initiative |
|------|------------|
| 1 | Project Management Platform |
| 2 | Internal Communications Platform |
| 3 | Vibe Marketing Platform |
| 4 | Learning Engineer Integration To Ludwitt |
| 5 | Startup/Entrepreneurship |
| 6 | Open Source Swarm |

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- npm (included with Node.js)

### Steps

1. **Clone or download the project**

   ```bash
   git clone <your-repo-url>
   cd Project-Management-Build
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
npm run build   # Create a production build
npm run start   # Run the production server (after build)
npm run lint    # Check code for linting issues
```

---

## Usage

### Executive Summary

When the app loads, the **Executive Summary** table shows all six initiatives. The **Cohort Submissions** column displays a progress bar and percentage that updates automatically as you tick checkboxes in the Initiative Summary tables below.

**Cohort Submissions formula:** (rows with at least one tick ÷ 67) × 100

Example: 12 rows with any checkbox ticked → **17.9%**

Click an initiative name to scroll directly to its detailed table.

### Initiative Summary

Each initiative table has 67 numbered rows. For each row:

1. Tick checkboxes to record submissions (empty = no, ticked = yes).
2. The **Status** column calculates completion: each of the 5 checkboxes counts as 20%.
3. The row background colour updates based on status:

| Status | Colour |
|--------|--------|
| 0% | Default (no fill) |
| 20% | Gray |
| 40% | Blue |
| 60% | Orange |
| 80% | Green |
| 100% | Purple + trophy |

### Go To Navigation

Use the **Go To** button at the bottom of the page to jump to:

- **Top** — Page header
- Any of the six initiative tables

### Dark Mode

Click the sun/moon icon in the header to switch themes. Your preference is saved automatically.

### Data Persistence

Cohort submission data is saved under the localStorage key `initiara-cohort-submissions`. Theme preference uses `initiara-theme`. Data persists after closing the browser unless you clear site data.

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework, routing, and static generation |
| [React 19](https://react.dev/) | UI library for interactive components |
| [TypeScript](https://www.typescriptlang.org/) | Static typing for safer, maintainable code |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS with custom dark-mode tokens |
| [Syne](https://fonts.google.com/specimen/Syne) | Display font for the INITIARA brand and section headings |
| [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | Client-side persistence for cohort data and theme |
| [ESLint](https://eslint.org/) | Code linting and quality checks |

---

## Project Structure

```
├── app/
│   ├── globals.css              # Global styles, Tailwind, section headings
│   ├── layout.tsx               # Root layout, fonts, theme provider
│   ├── page.tsx                 # Main dashboard page
│   └── initiatives/
│       └── [slug]/
│           ├── page.tsx         # Placeholder initiative detail page
│           └── not-found.tsx    # Branded 404 for invalid slugs
├── components/
│   ├── CohortRow.tsx            # Memoized table row with gamification
│   ├── Dashboard.tsx            # Executive Summary table
│   ├── GoToNav.tsx              # Go To dropdown navigation
│   ├── InitiativeSummary.tsx    # Initiative Summary section and tables
│   ├── PageHeader.tsx           # Shared header with theme toggle
│   ├── ThemeProvider.tsx        # Dark/light theme context
│   └── ThemeToggle.tsx          # Theme switch button
├── hooks/
│   └── useCohortSubmissions.ts  # Cohort state and localStorage sync
├── lib/
│   ├── cohortSubmissions.ts     # Types, calculations, storage helpers
│   ├── health.ts                # Overall health indicator logic
│   ├── initiatives.ts           # Initiative definitions and anchors
│   ├── rowTiers.ts              # Status tier colours and legend config
│   └── tableStyles.ts           # Shared table CSS class strings
└── package.json
```

---

## License

MIT
