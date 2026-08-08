# PyByte — Learn Python in 5 Minutes a Day

A focused Python micro-learning application integrated with Ludwitt OAuth 2.0 authentication and AI tutor proxying.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** JavaScript
- **Authentication:** Ludwitt OAuth 2.0 with PKCE (S256)
- **Session Management:** Encrypted HTTP-only cookies using jose
- **AI Integration:** Ludwitt AI proxy for Python tutoring
- **Deployment:** Vercel

## Environment Variables

Create `.env.local` locally and configure the following in Vercel:

```env
LUDWITT_CLIENT_ID=le_aa66000f7ab45563e7b4dd
LUDWITT_CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_random_session_secret
LUDWITT_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** 
- Never commit `.env.local` or secrets to git
- Update `LUDWITT_REDIRECT_URI` for production (e.g., `https://your-app.vercel.app/api/auth/callback`)
- Add the production callback URI in the Ludwitt developer portal

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to start the OAuth flow.

## Production Deployment

### Vercel Setup

1. Import this project into Vercel
2. Configure environment variables in Vercel dashboard
3. Update `LUDWITT_REDIRECT_URI` to production URL
4. Add production callback URI in Ludwitt portal
5. Deploy

### Build Verification

```bash
npm run build
npm start
```

## Architecture

### Authentication Flow

1. User clicks "Sign in with Ludwitt" → `/api/auth/signin`
2. Server creates PKCE challenge and OAuth state
3. Redirect to Ludwitt OAuth authorize endpoint
4. User authorizes → callback to `/api/auth/callback`
5. Server exchanges code for access/refresh tokens
6. Server fetches user profile from Ludwitt
7. Creates encrypted HTTP-only session cookie
8. Redirects to `/learn`

### Session Management

- Encrypted JWT session using `jose` library
- HTTP-only, secure, sameSite=lax cookies
- Automatic token refresh when access token expires
- Session contains: sub, email, name, picture, access/refresh tokens

### API Endpoints

- `GET /api/auth/signin` — Initiates OAuth flow
- `GET /api/auth/callback` — OAuth callback handler
- `GET /api/me` — Returns authenticated user profile
- `GET /api/credits` — Returns Ludwitt credit balance
- `POST /api/tutor` — Proxies AI tutor requests to Ludwitt

### Security

- All secrets server-side only (never exposed to browser)
- Encrypted session cookies with expiration
- PKCE for OAuth code exchange
- State parameter to prevent CSRF
- Automatic token refresh logic

## Course Content

Six 5-minute Python lessons:
1. Variables
2. Strings  
3. Lists
4. Conditionals
5. Loops
6. Functions

Each lesson includes code examples and a quiz question.

## Ludwitt Integration

- **OAuth 2.0:** Standard authorization code flow with PKCE
- **Scopes:** `profile credits:read credits:spend`
- **AI Proxy:** Tutor requests proxied through Ludwitt API
- **Credit System:** AI usage tracked via Ludwitt credit balance

## Project Structure

```
src/
  app/
    api/
      auth/
        signin/route.js
        callback/route.js
      credits/route.js
      me/route.js
      tutor/route.js
    learn/
      page.js
      LearningClient.js
    globals.css
    layout.js
    page.js
  lib/
    auth.js          # Session encryption/decryption
    course.js        # Lesson and quiz content
    env.js           # Environment variable validation
    ludwitt.js       # Ludwitt API client
    session.js       # Active session with token refresh
```

## License

Private project for Ludwitt/Hult platform integration.
