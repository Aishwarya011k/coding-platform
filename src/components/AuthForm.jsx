import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login' || mode === 'signup') {
        const url = mode === 'login' ? `${API_BASE_URL}/api/login` : `${API_BASE_URL}/api/signup`;
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Auth failed');
        onLogin(data.token);
        return;
      }

      if (mode === 'forgot') {
        // request OTP for reset
        const resp = await fetch(`${API_BASE_URL}/api/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, purpose: 'reset' }) });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to request reset code');
        setInfo('Reset code sent to email. Enter code and new password.');
        setMode('reset');
        return;
      }

      if (mode === 'reset') {
        if (!code || !newPassword) return setError('Code and new password required');
        const resp = await fetch(`${API_BASE_URL}/api/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, purpose: 'reset', newPassword }) });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Reset failed');
        setInfo('Password reset successful. Please login.');
        setMode('login');
        setPassword('');
        setCode('');
        setNewPassword('');
        return;
      }

      if (mode === 'verify') {
        // verify email using code
        if (!code) return setError('Code required');
        const resp = await fetch(`${API_BASE_URL}/api/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, purpose: 'verify' }) });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Verify failed');
        setInfo('Email verified. You can now login.');
        setMode('login');
        setCode('');
        return;
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const requestVerify = async () => {
    setError('');
    setInfo('');
    try {
      if (!email) return setError('Enter your email to request verification');
      const resp = await fetch(`${API_BASE_URL}/api/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, purpose: 'verify' }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to request verification code');
      setInfo('Verification code sent to email. Enter the code below.');
      setMode('verify');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Forgot password' : mode === 'reset' ? 'Reset password' : mode === 'verify' ? 'Verify email' : ''}</h3>
      <form onSubmit={submit}>
        {(mode === 'signup' || mode === 'login' || mode === 'forgot' || mode === 'verify') && (
          <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        )}

        {mode === 'signup' && (
          <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        )}

        {mode === 'reset' && (
          <>
            <div><input placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} /></div>
            <div><input placeholder="New password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></div>
          </>
        )}

        {mode === 'verify' && (
          <div><input placeholder="Verification code" value={code} onChange={e=>setCode(e.target.value)} /></div>
        )}

        <div style={{ marginTop:8 }}>
          {(mode === 'login' || mode === 'signup') && <button type="submit">{mode === 'login' ? 'Login' : 'Sign up'}</button>}
          {mode === 'forgot' && <button type="submit">Request reset code</button>}
          {mode === 'reset' && <button type="submit">Reset password</button>}
          {mode === 'verify' && <button type="submit">Verify</button>}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginLeft:8 }}>{mode === 'login' ? 'Create account' : 'Have an account? Login'}</button>
        </div>

        <div style={{ marginTop:8 }}>
          {mode !== 'forgot' && <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} style={{ marginRight:8 }}>Forgot password?</button>}
          {mode !== 'verify' && <button type="button" onClick={requestVerify}>Verify email</button>}
        </div>

        {info && <div style={{ color:'green', marginTop:8 }}>{info}</div>}
        {error && <div style={{ color:'red', marginTop:8 }}>{error}</div>}
      </form>
    </div>
  );
}
