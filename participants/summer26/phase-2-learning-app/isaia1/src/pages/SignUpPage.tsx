import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBackground from '../components/AppBackground';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    const { error: signUpError } = signUp(email.trim(), password, displayName.trim());
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    } else {
      setSuccess('Account created! You are signed in.');
    }
  };

  return (
    <>
      <AppBackground />
      <div className="page page-narrow page-scroll">
        <form onSubmit={handleSignUp} className="fade-in" style={{ paddingTop: 32 }}>
          <Logo size="sm" />
          <h1 className="h2" style={{ textAlign: 'center', marginTop: 24, marginBottom: 6 }}>Create account</h1>
          <p className="subtitle" style={{ textAlign: 'center', marginBottom: 28 }}>Start your learning journey today</p>

          {error && <div className="banner-error">{error}</div>}
          {success && <div className="banner-success">{success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Display Name</label>
            <input id="name" className="form-input" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className="form-input" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>
            Already have an account? <Link to="/login" className="btn-link">Sign In</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14 }}>
            <Link to="/forgot-password" className="btn-link">Forgot password?</Link>
          </p>
        </form>
      </div>
    </>
  );
}
