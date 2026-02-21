import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d';

// Redirect to Google OAuth
export const redirectToGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Handle Google OAuth callback
export const handleGoogleCallback = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=authentication_failed`);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      // Redirect back to frontend with token and user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture,
        authProvider: user.auth_provider
      }))}`;

      res.redirect(redirectUrl);
    })(req, res);
  });
};