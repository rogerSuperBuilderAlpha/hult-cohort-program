import { useState } from 'react';
import { createPkcePair, PKCE_VERIFIER_KEY } from '../lib/ludwitt/pkce';
import { startLudwittOAuth } from '../services/ludwittApi';

export default function LudwittSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setLoading(true);
    try {
      const { codeVerifier, codeChallenge } = await createPkcePair();
      sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
      const { authorizeUrl } = await startLudwittOAuth(codeChallenge);
      window.location.href = authorizeUrl;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Could not start Ludwitt sign-in.');
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {error && <div className="banner-error" style={{ marginBottom: 12 }}>{error}</div>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-ludwitt"
      >
        {loading ? 'Redirecting…' : 'Sign in with Ludwitt'}
      </button>
    </div>
  );
}
