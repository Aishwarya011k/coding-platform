import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);

    if (userResult.rows.length > 0) {
      // User exists, return user
      return done(null, userResult.rows[0]);
    }

    // Check if user exists with same email
    userResult = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);

    if (userResult.rows.length > 0) {
      // User exists with same email but different provider
      // Update the user to link Google account
      const user = userResult.rows[0];
      await pool.query(
        'UPDATE users SET google_id = $1, profile_picture = $2, auth_provider = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [profile.id, profile.photos[0].value, 'google', user.id]
      );

      // Get updated user
      const updatedUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      return done(null, updatedUserResult.rows[0]);
    }

    // Create new user
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, google_id, profile_picture, auth_provider, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
      [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value, 'google']
    );

    return done(null, insertResult.rows[0]);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session (though we're not using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;