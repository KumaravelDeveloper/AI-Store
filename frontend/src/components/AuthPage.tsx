import React, { useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: (token: string, user: { id: number; email: string }) => void;
  setCurrentTab: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, setCurrentTab }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  


  const API_BASE = 'http://localhost:5000/api';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.unverified) {

          // Pre-populate email and transition to verification screen
          setEmail(data.email);
          setMode('verify');
          setErrorMsg('This email is registered but not verified. Please verify now.');
        } else {
          setErrorMsg(data.error || 'Login failed. Please check credentials.');
        }
        return;
      }

      onLoginSuccess(data.token, data.user);
      setCurrentTab('discover');
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Sign Up failed.');
        return;
      }


      setSuccessMsg('Account created! Please enter verification code.');
      setMode('verify');
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !verificationCode) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid code. Please try again.');
        return;
      }

      setSuccessMsg('Email verified successfully! You can now sign in.');
      setMode('login');
      setVerificationCode('');

    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel animate-fade-in">
        
        {/* Toggle between login / signup headers */}
        <div className="auth-header">
          {mode === 'login' && (
            <>
              <h2 className="auth-card-title">🔑 Access AI Store</h2>
              <p className="auth-card-subtitle">Sign in to save custom tools stacks and manage collections.</p>
            </>
          )}
          {mode === 'signup' && (
            <>
              <h2 className="auth-card-title">🚀 Create Account</h2>
              <p className="auth-card-subtitle">Register to unlock personalized AI workflows and suggest nodes.</p>
            </>
          )}
          {mode === 'verify' && (
            <>
              <h2 className="auth-card-title">✉️ Email Verification</h2>
              <p className="auth-card-subtitle">We sent a 6-digit confirmation code to: <strong>{email}</strong></p>
            </>
          )}
        </div>

        {errorMsg && <div className="form-error-alert">⚠️ {errorMsg}</div>}
        {successMsg && (
          <div className="form-success-alert" style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
            🎉 {successMsg}
          </div>
        )}


        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="auth-switch-prompt">
              Don't have an account?{' '}
              <span className="switch-link" onClick={() => { setMode('signup'); setErrorMsg(''); }}>
                Create one now
              </span>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <div className="auth-switch-prompt">
              Already have an account?{' '}
              <span className="switch-link" onClick={() => { setMode('login'); setErrorMsg(''); }}>
                Sign In
              </span>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                className="form-control verification-input"
                placeholder="e.g. 123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email Address'}
            </button>
            <div className="auth-switch-prompt">
              Entered wrong email?{' '}
              <span className="switch-link" onClick={() => { setMode('signup'); setErrorMsg(''); }}>
                Start over
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
