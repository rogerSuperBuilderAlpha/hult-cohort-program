# Deployment Instructions (30-Minute Challenge)

You have a functioning real-time chat Next.js application ready for deployment. Follow these steps to deploy and test within the remaining time.

### 1. Setup Supabase
1. Go to [database.new](https://database.new) to create a new Supabase project (takes ~1 minute).
2. Go to the **SQL Editor** in your new project.
3. Open `supabase_schema.sql` (found in your `textme` folder), copy all of its contents, and run it in the SQL Editor. This sets up the real-time tables.
4. Go to **Project Settings > API**. Copy the **Project URL** and **anon key**.

### 2. Deploy to Vercel
1. Open a terminal in the `textme` directory.
2. Run `npx vercel`
   - It will prompt you to log in if you haven't.
   - Answer `Y` to "Set up and deploy".
   - Accept the defaults (Scope, Project name, Directory `.` ).
3. **Crucial Step:** When it asks "Want to override the settings?", say **No**.
4. Once deployed, Vercel will give you a **Production URL**.

### 3. Add Environment Variables
1. Go to your new Vercel Project Dashboard (from the link provided in the terminal).
2. Navigate to **Settings > Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Your Supabase anon key)
4. Go to the **Deployments** tab and click **Redeploy** on the latest deployment so it picks up the environment variables.

### 4. Test It
1. Open your Vercel URL in two different browser windows.
2. The UI is pre-configured with a "mock user" for immediate testing without setting up full auth (which takes too long for the 30m constraint). 
3. Type a message in one window—it will instantly appear in the other via Supabase WebSockets!

### Submit
Copy your Vercel URL into `.github/PULL_REQUEST_TEMPLATE.md` and create your submission PR!
