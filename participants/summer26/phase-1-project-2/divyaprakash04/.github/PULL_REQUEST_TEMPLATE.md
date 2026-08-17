## Production URL
https://textmeweek2cursor.vercel.app/

## PM platform integration notes
- **Shared Authentication & Integration**: Since Forth (the Week 1 PM platform) currently exposes no public API, direct integration is not yet implemented. 
- **What it would take**: If Forth exposes webhooks, HultChat's architecture already includes a `/api/forth/webhook` route placeholder that can accept POST requests from Forth when a task is updated, instantly inserting a real-time notification to the relevant user via Supabase WebSockets. Deep linking can also be implemented on the frontend by simply detecting URLs matching the Forth domain and rendering them as Task Preview Cards in the chat stream.

## Agent usage
This project was rapidly bootstrapped with the help of an AI agent (Gemini 3.1 Pro via Antigravity IDE). The agent generated the Next.js scaffold, implemented the Supabase real-time WebSocket subscriptions on the `messages` table, crafted the database schema and RLS policies, structured the UI components, and automated the Git submission workflow.

## Additional Architecture Details
- **Frontend**: Next.js (App Router), TailwindCSS.
- **Backend & Database**: Supabase (PostgreSQL) with Row Level Security (RLS) for data protection.
- **Real-Time**: Supabase Realtime WebSocket subscriptions on the `messages` and `notifications` tables.
- **Deployment**: Vercel Edge Network for seamless scalability.
- **Motivation**: To support 67+ concurrent users flawlessly, Supabase natively provides WebSockets out of the box for real-time messaging, removing the need for a separate WebSocket server.
