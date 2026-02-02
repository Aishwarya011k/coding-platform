import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export default function Account({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState('');
  const [verifyRequested, setVerifyRequested] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': 'Bearer ' + token };
    fetch(`${API_BASE_URL}/api/me`, { headers }).then(r=>r.json()).then(d=>{
      if (d.error) setError(d.error); else setProfile(d.user);
    }).catch(e=>setError(e.message));
    fetch(`${API_BASE_URL}/api/submissions`, { headers }).then(r=>r.json()).then(d=>{
      if (d.error) setError(d.error); else setSubs(d.submissions || []);
    }).catch(e=>setError(e.message));
  }, [token]);

  if (!token) return null;

  return (
    <div style={{ padding:12 }}>
      <h3>Account</h3>
      {error && <div style={{ color:'red' }}>{error}</div>}
      {profile ? (
        <div>
          <div><strong>{profile.name || profile.email}</strong></div>
          <div>Member since: {new Date(profile.createdAt).toLocaleString()}</div>
          <div style={{ marginTop:8 }}>
            {!verifyRequested && <button onClick={async () => {
              setError(''); setVerifyMsg('');
              try {
                const resp = await fetch(`${API_BASE_URL}/api/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profile.email, purpose: 'verify' }) });
                const d = await resp.json();
                if (!resp.ok) throw new Error(d.error || 'Request failed');
                setVerifyRequested(true);
                setVerifyMsg('Verification code sent to your email.');
              } catch (e) { setError(e.message); }
            }}>Request verification email</button>}
            {verifyRequested && (
              <div style={{ marginTop:8 }}>
                <input placeholder="Enter code" value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} />
                <button onClick={async () => {
                  setError(''); setVerifyMsg('');
                  try {
                    const resp = await fetch(`${API_BASE_URL}/api/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profile.email, code: verifyCode, purpose: 'verify' }) });
                    const d = await resp.json();
                    if (!resp.ok) throw new Error(d.error || 'Verify failed');
                    setVerifyMsg('Email verified.');
                    setVerifyRequested(false);
                    setVerifyCode('');
                    // refresh profile
                    const r2 = await fetch(`${API_BASE_URL}/api/me`, { headers: { 'Authorization': 'Bearer ' + token } });
                    const j2 = await r2.json(); if (!r2.ok) throw new Error(j2.error || 'Refresh failed'); setProfile(j2.user);
                  } catch (e) { setError(e.message); }
                }} style={{ marginLeft:8 }}>Submit code</button>
              </div>
            )}
            {verifyMsg && <div style={{ color:'green', marginTop:8 }}>{verifyMsg}</div>}
          </div>
          <div>Streak: {profile.streak || 0}</div>
          <div style={{ marginTop:12 }}>
            <button onClick={onLogout}>Logout</button>
          </div>
        </div>
      ) : <div>Loading...</div>}

      <h4 style={{ marginTop:16 }}>Submission history</h4>
      {subs.length === 0 ? <div>No submissions yet.</div> : (
        <div style={{ maxHeight:300, overflow:'auto' }}>
          {subs.map(s => (
            <div key={s.id} style={{ padding:8, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div><strong>Problem:</strong> {s.problemId ?? 'N/A'} • <strong>Lang:</strong> {s.language}</div>
              <div><strong>Score:</strong> {s.score ?? 'N/A'} • <strong>Date:</strong> {new Date(s.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
