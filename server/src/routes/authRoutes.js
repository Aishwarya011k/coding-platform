import express from 'express';
import { signup, signin, signout, getUserProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { redirectToGoogle, handleGoogleCallback } from '../controllers/googleAuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateSignup, validateSignin, validate } from '../utils/validators.js';

const router = express.Router();

// Local Authentication Routes
// Sign Up with validation
router.post('/signup', validateSignup, validate, signup);

// Sign In with validation
router.post('/signin', validateSignin, validate, signin);

// Sign Out
router.post('/signout', signout);

// Protected route to get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Forgot Password - Generate reset token
router.post('/forgot-password', forgotPassword);

// Reset Password - Verify token and update password
router.post('/reset-password', resetPassword);

// Google OAuth Routes
// Redirect to Google OAuth
router.get('/google', redirectToGoogle);

// Google OAuth callback
router.get('/google/callback', handleGoogleCallback);

export default router;
