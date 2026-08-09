import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBackground from '../components/AppBackground';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    const { error: resetError, message } = resetPassword(email.trim(), newPassword);
    setLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      setSuccess(message ?? 'Password reset successful.');
    }
  };

  return (
    <>
      <AppBackground />
      <div className="page page-narrow page-scroll">
        <form onSubmit={handleReset} className="fade-in" style={{ paddingTop: 48 }}>
          <Logo size="sm" />
          <h1 className="h2" style={{ textAlign: 'center', marginTop: 24, marginBottom: 6 }}>Forgot password?</h1>
          <p className="subtitle" style={{ textAlign: 'center', marginBottom: 28 }}>
            Enter your email and choose a new password.
          </p>

          {error && <div className="banner-error">{error}</div>}
          {success && <div className="banner-success">{success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input id="newPassword" className="form-input" type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" className="form-input" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Link to="/login" className="btn-link">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </>
  );
}
