// Firebase GitHub sign-in (signInWithPopup) embeds an iframe from the Firebase
// auth domain (https://<project>.firebaseapp.com/__/auth/iframe) and loads
// https://apis.google.com/js/api.js in the parent page. A CSP without frame-src
// (which then falls back to default-src 'self') blocks that iframe and breaks
// sign-in entirely — this took down login in production on 2026-07-05.
const firebaseAuthDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || 'hult-cohorts.firebaseapp.com';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  `frame-src 'self' https://${firebaseAuthDomain} https://*.firebaseapp.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
