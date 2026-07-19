## Project 1 — Submission (Divya Prakash)

### 🔗 GitHub Repository
[https://github.com/DivyaPrakash04/hult-cohort-program-CursorSummer2026](https://github.com/DivyaPrakash04/hult-cohort-program-CursorSummer2026)

### 🌐 Production URL
[https://ourvelocity.vercel.app/](https://ourvelocity.vercel.app/)

### ⚙️ Setup Steps (Verified on Fresh Clone)
1. Clone the app repo:
   ```
   git clone https://github.com/DivyaPrakash04/ourvelocity.git
   cd ourvelocity
   ```
2. Create `.env.local` using `.env.example` and fill:
   - NEXT_PUBLIC_SUPABASE_URL  
   - NEXT_PUBLIC_SUPABASE_ANON_KEY  
   - SUPABASE_SERVICE_ROLE_KEY  
   - OPENAI_API_KEY (optional)  
   - GEMINI_API_KEY (optional)
3. In Supabase Dashboard:
   - Run `supabase/schema.sql` in SQL Editor  
   - Set Auth → URL Configuration:
     - Site URL: [https://ourvelocity.vercel.app](https://ourvelocity.vercel.app)
     - Redirect URLs:
       [https://ourvelocity.vercel.app](https://ourvelocity.vercel.app)  
       [https://ourvelocity.vercel.app/login](https://ourvelocity.vercel.app/login)  
       [https://ourvelocity.vercel.app/dashboard](https://ourvelocity.vercel.app/dashboard)  
       [https://ourvelocity.vercel.app/auth/callback](https://ourvelocity.vercel.app/auth/callback)  
   - Disable "Confirm email"
4. Install dependencies:
   ```
   npm install
   ```
5. Start dev server:
   ```
   npm run dev
   ```
6. Open http://localhost:3000 → Sign up → Create project → Kanban loads

### 🏗️ Architecture Summary
- Next.js 14 App Router  
- Supabase (Postgres + Realtime + RLS shared workspace)  
- OpenAI + Gemini structured JSON generation  
- AI → Supabase ingestion pipeline  
- Real-time Kanban board  
- URL-driven Query Matrix  
- Momentum dashboard  
- Automated Standup Suite  

### 🎯 Motivation / Engagement Design
- "Magic Moment": raw idea → structured plan → live kanban  
- High-contrast Linear-style UI  
- Real-time updates to keep founders engaged  
- Standup Suite for daily accountability  

### ⚠️ Known Limitations
- UI polish is minimal (functional but not Linear-level)  
- Magic link authentication depends on correct Supabase Auth URL configuration (now fixed)  
- Multi-user RLS allows all authenticated users to share workspace (cohort model)  
- No mobile layout  

### 🤖 Agent Usage Summary
- OpenAI + Gemini JSON schema for project decomposition  
- AI-generated standup summaries  
- No autonomous agents (single-shot generation only)
