import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function Account({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const fetchProfile = async () => {
      try {
        const data = await authService.getUserProfile();
        setProfile(data);
      } catch (e) {
        // If token is invalid, silently log out
        if (e.message.includes('Invalid token') || e.message.includes('401')) {
          localStorage.removeItem('cp_token');
          localStorage.removeItem('cp_user');
          onLogout();
        }
      }
    };

    const fetchSubmissions = async () => {
      try {
        const headers = { 'Authorization': 'Bearer ' + token };
        const resp = await fetch(`${API_BASE_URL}/submissions`, { headers });
        const data = await resp.json();
        if (data.error) setError(data.error);
        else setSubs(data.submissions || []);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchProfile();
    fetchSubmissions();
  }, [token, onLogout]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.signout();
      onLogout();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div style={{ padding: 12 }}>
      <h3>Account</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {profile ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {profile.profilePicture && (
              <img 
                src={profile.profilePicture} 
                alt="Profile" 
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
              />
            )}
            <div>
              <div><strong>{profile.name || profile.email}</strong></div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Signed in with {profile.authProvider === 'google' ? 'Google' : 'Email'}
              </div>
            </div>
          </div>
          <div>Email: {profile.email}</div>
          {profile.createdAt && <div>Member since: {new Date(profile.createdAt).toLocaleString()}</div>}
          <div style={{ marginTop: 12 }}>
            <button onClick={handleLogout} disabled={loading} style={{ padding: '8px 16px' }}>
              {loading ? 'Logging out...' : 'Sign out'}
            </button>
          </div>
        </div>
      ) : (
        <div>Loading profile...</div>
      )}
      
      <div style={{ marginTop: 20 }}>
        <h4>Recent Submissions</h4>
        {subs.length > 0 ? (
          <ul>
            {subs.slice(0, 5).map(sub => (
              <li key={sub.id}>
                Problem {sub.problemId} - {sub.language} - Score: {sub.score}
              </li>
            ))}
          </ul>
        ) : (
          <p>No submissions yet</p>
        )}
      </div>
    </div>
  );
}
