import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppBackground from '../components/AppBackground';
import Logo from '../components/Logo';
import { PKCE_VERIFIER_KEY } from '../lib/ludwitt/pkce';
import { completeLudwittOAuth } from '../services/ludwittApi';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const oauthError = searchParams.get('error');
    const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

    if (oauthError) {
      setError(searchParams.get('error_description') ?? oauthError);
      return;
    }

    if (!code || !state || !codeVerifier) {
      setError('Missing OAuth parameters. Please try signing in again.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await completeLudwittOAuth(code, state, codeVerifier);
        sessionStorage.removeItem(PKCE_VERIFIER_KEY);
        await refreshSession();
        if (!cancelled) navigate('/', { replace: true });
      } catch (err) {
        sessionStorage.removeItem(PKCE_VERIFIER_KEY);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Sign-in failed.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshSession, searchParams]);

  return (
    <>
      <AppBackground />
      <div className="loading-screen">
        <Logo size="sm" />
        {error ? (
          <div className="banner-error" style={{ maxWidth: 420, marginTop: 24 }}>
            {error}
          </div>
        ) : (
          <>
            <div className="spinner" />
            <p className="subtitle" style={{ marginTop: 16 }}>Completing Ludwitt sign-in…</p>
          </>
        )}
      </div>
    </>
  );
}
