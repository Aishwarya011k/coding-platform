import React, { useState } from 'react';
import authService from '../services/authService';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

export default function AuthForm({ onLogin, onForgotPassword, onResetPassword }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        const data = await authService.signup(name, email, password);
        setInfo('Account created successfully! Logging in...');
        setTimeout(() => {
          onLogin(data.token);
        }, 1000);
        return;
      }

      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        const data = await authService.signin(email, password);
        setInfo('Login successful!');
        setTimeout(() => {
          onLogin(data.token);
        }, 1000);
        return;
      }

      // Future modes for forgot password, reset, verify can be added here
      if (mode === 'forgot') {
        throw new Error('Password reset not yet implemented');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign in
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await authService.googleSignIn();
      // User will be redirected to Google OAuth
    } catch (e) {
      setError(e.message);
      setGoogleLoading(false);
    }
  };

  // Handle forgot password flow
  if (mode === 'forgot') {
    return (
      <ForgotPassword 
        onBack={() => { setMode('login'); setError(''); setInfo(''); }}
        onResetTokenReceived={(token, userEmail) => {
          setResetToken(token);
          setEmail(userEmail);
          setMode('reset');
        }}
      />
    );
  }

  // Handle reset password flow
  if (mode === 'reset') {
    return (
      <ResetPassword 
        resetToken={resetToken}
        email={email}
        onSuccess={() => {
          setMode('login');
          setError('');
          setInfo('Password reset successful! Please log in.');
          setEmail('');
          setPassword('');
          setResetToken('');
        }}
        onBack={() => { setMode('login'); setError(''); setInfo(''); setResetToken(''); }}
      />
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Authentication'}</h3>
      <form onSubmit={submit}>
        {(mode === 'signup' || mode === 'login') && (
          <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} /></div>
        )}

        {mode === 'signup' && (
          <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} disabled={loading} /></div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} /></div>
        )}

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
          <button 
            type="button" 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}
            style={{ marginLeft: 8 }}
            disabled={loading}
          >
            {mode === 'login' ? 'Create account' : 'Have an account? Sign in'}
          </button>
        </div>

        {/* Google OAuth Button */}
        {(mode === 'login' || mode === 'signup') && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ marginBottom: 8, color: '#666', fontSize: '14px' }}>or</div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              style={{
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '200px',
                opacity: googleLoading ? 0.7 : 1
              }}
            >
              {googleLoading ? (
                'Connecting...'
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    style={{ marginRight: '8px' }}
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        )}

        {mode === 'login' && (
          <button 
            type="button" 
            onClick={() => { setMode('forgot'); setError(''); setInfo(''); setEmail(''); }}
            style={{ marginTop: 8, background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', padding: 0 }}
            disabled={loading}
          >
            Forgot password?
          </button>
        )}

        {info && <div style={{ color: 'green', marginTop: 8, fontSize: '14px' }}>{info}</div>}
        {error && <div style={{ color: 'red', marginTop: 8, fontSize: '14px' }}>{error}</div>}
      </form>
    </div>
  );
}
