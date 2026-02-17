const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const authService = {
  // Sign up user
  signup: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('cp_token', data.token);
        localStorage.setItem('cp_user', JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        }));
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Sign in user
  signin: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signin failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('cp_token', data.token);
        localStorage.setItem('cp_user', JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        }));
      }

      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  },

  // Sign out user
  signout: async () => {
    try {
      const token = localStorage.getItem('cp_token');
      
      const response = await fetch(`${API_BASE_URL}/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signout failed');
      }

      // Clear localStorage
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');

      return data;
    } catch (error) {
      console.error('Signout error:', error);
      // Clear localStorage anyway
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('cp_token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Get stored user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('cp_user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('cp_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('cp_token');
  },

  // Forgot Password - Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process forgot password request');
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset Password - Update password with reset token
  resetPassword: async (token, email, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};

export default authService;
