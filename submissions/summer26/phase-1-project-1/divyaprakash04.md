## Project 1 — Submission (Divya Prakash)

### 🔗 GitHub Repository
[https://github.com/DivyaPrakash04/hult-cohort-program-CursorSummer2026](https://github.com/DivyaPrakash04/hult-cohort-program-CursorSummer2026)

### 🌐 Production URL
https://ourvelocity.vercel.app/

### ⚙️ Setup Steps (Verified on Fresh Clone)
1. Clone repo  
2. Create `.env.local` with:
   - `OPENAI_API_KEY` 
   - `SUPABASE_URL` 
   - `SUPABASE_SERVICE_ROLE_KEY` 
   - `NEXT_PUBLIC_SUPABASE_URL` 
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open `http://localhost:3000` 

### 🏗️ Architecture Summary
- Next.js 14 App Router  
- Supabase (DB + Realtime)  
- OpenAI structured JSON generation  
- AI → Supabase ingestion pipeline  
- Real-time Kanban board  
- Query Matrix (URL-driven filters)  
- Momentum dashboard  
- Automated Standup Suite  

### 🎯 Motivation / Engagement Design
- "Magic Moment" = raw idea → structured plan → live kanban  
- High-contrast UI for clarity  
- Real-time updates to keep founders engaged  
- Standup Suite for daily accountability  

### ⚠️ Known Limitations
- UI polish is minimal (functional but not Linear-level)  
- Magic link authentication requires Supabase Auth URL configuration  
- Multi-user RLS allows all authenticated users to share workspace (cohort model)  
- No mobile layout  

### 🤖 Agent Usage Summary
- OpenAI JSON schema for project decomposition  
- AI-generated standup summaries  
- No autonomous agents (single-shot generation only)
