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
