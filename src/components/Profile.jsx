import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      try {
        // In a real app, this would be an API call to get user data
        // For now, we'll simulate a potential delay or API call
        setTimeout(() => {
          // You can set a mock user object here or leave it as null
          // to demonstrate the error handling
          setUser({
            name: 'John Doe',
            email: 'john@example.com',
            username: 'johndoe',
            joinedDate: new Date().toLocaleDateString(),
            submissions: 5,
            rank: 'Intermediate'
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {user ? (
        <div className="profile-details">
          <h3>{user.name || 'N/A'}</h3>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Member since:</strong> {user.joinedDate || 'N/A'}</p>
          <p><strong>Submissions:</strong> {user.submissions || 0}</p>
          <p><strong>Rank:</strong> {user.rank || 'N/A'}</p>
        </div>
      ) : (
        <div className="no-user">
          <p>No user data available. Please log in.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Profile;