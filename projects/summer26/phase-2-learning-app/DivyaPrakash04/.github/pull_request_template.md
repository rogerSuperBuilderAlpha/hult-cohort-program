## [P2-L1] Submission — {handle}

### Integration credentials

- **Ludwitt client ID:** `le_aa66000f7ab45563e7b4dd`
- **Production listing URL:** `https://YOUR-PRODUCTION-LISTING-URL`

### Integration evidence

- [ ] The Ludwitt OAuth authorize flow reaches `GET /api/auth/callback` with a verified state value.
- [ ] The callback exchanges the authorization code server-to-server and redirects to `/learn`.
- [ ] A `user_session` cookie is encrypted and HTTP-only; browser requests never include tokens or the client secret.
- [ ] The AI tutor successfully uses Ludwitt's credit proxy, or correctly surfaces insufficient paid credits.

### Notes to reviewers

PyByte is a mobile-first Python micro-learning application with six lessons and six quizzes. It uses OAuth with PKCE, an encrypted HTTP-only session, Ludwitt userinfo, and the server-side Ludwitt AI credit proxy.
