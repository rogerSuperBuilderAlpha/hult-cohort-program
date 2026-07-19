'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#fffae7',
          color: '#2b2b2b',
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          padding: '48px 24px',
        }}
      >
        <main style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 12 }}>
            Error
          </p>
          <h1 style={{ fontSize: '1.75rem', margin: '8px 0 16px' }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.5, marginBottom: 24 }}>
            The Hult Cohort platform failed to load. Try again, or email{' '}
            <a href="mailto:cohort@hult.edu">cohort@hult.edu</a>
            {error.digest ? ` (ref ${error.digest})` : ''}.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '14px 28px',
              background: '#cc164c',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
