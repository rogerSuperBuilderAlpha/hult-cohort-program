## 1. Production URL
[Paste Your Vercel URL Here]

## 2. Setup steps verified on fresh clone
1. Clone this repository and navigate to `participants/summer26/phase-1-project-2/divyaprakash04/`.
2. Run `npm install`.
3. Create a Supabase project at `database.new` and run `supabase_schema.sql` (and `fix_demo.sql` to test the mock user) in your SQL editor.
4. Set environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Run `npm run dev` to test locally.

## 3. Architecture summary
- **Frontend**: Next.js (App Router), TailwindCSS, Shadcn UI.
- **Backend & Database**: Supabase (PostgreSQL) with Row Level Security (RLS) for data protection.
- **Real-Time**: Supabase Realtime WebSocket subscriptions on the `messages` and `notifications` tables.
- **Deployment**: Vercel Edge Network for seamless scalability.

## 4. Motivation / engagement design notes
- To support 67+ concurrent users flawlessly, I chose **Supabase** because it natively provides WebSockets out of the box for real-time messaging, removing the need for a separate WebSocket server.
- The interface emphasizes immediate feedback, avoiding polling so that cohort members have a fast, frictionless engagement experience.

## 5. Known limitations
- E2E encryption is not currently implemented for Direct Messages.
- Full OAuth is mocked for the demo preview to ensure immediate testing capabilities without needing sign-ups; production requires toggling the RLS policies back on.

## 6. Agent usage summary
This project was rapidly bootstrapped with the help of an AI agent (Gemini 3.1 Pro via Antigravity IDE). The agent generated the Next.js scaffold, implemented the Supabase real-time WebSocket subscriptions on the `messages` table, crafted the database schema and RLS policies, structured the UI components, and automated the Git submission workflow.
