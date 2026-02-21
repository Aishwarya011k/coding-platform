import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-secure-secret';

// Helper function to generate reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper function to hash token
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Sign Up
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check for duplicate email
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, auth_provider, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, email, auth_provider',
            [name, email, hashedPassword, 'local']
        );

        const user = result.rows[0];

        // Create JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Return user info and token
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            authProvider: user.auth_provider,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Sign In
export const signin = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find user by email
        const result = await pool.query('SELECT id, email, name, password, auth_provider FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (user.auth_provider !== 'local') {
            return res.status(400).json({ message: 'Please use Google OAuth to sign in' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Return user info and token
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            authProvider: user.auth_provider,
            token
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Sign Out
export const signout = (req, res) => {
    // Invalidate the token on the client-side (e.g., by removing it from local storage)
    res.status(200).json({ message: 'Successfully signed out' });
};

// Get User Profile (Protected Route)
export const getUserProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const result = await pool.query('SELECT id, name, email, auth_provider, profile_picture, created_at FROM users WHERE id = $1', [req.user.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            authProvider: user.auth_provider,
            profilePicture: user.profile_picture,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password - Generate reset token and send email
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Check if user exists
        const result = await pool.query('SELECT id, name, email, auth_provider FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // Don't reveal if email exists (security best practice)
            return res.status(200).json({ message: 'If email exists, reset link has been sent' });
        }

        const user = result.rows[0];

        if (user.auth_provider !== 'local') {
            return res.status(400).json({ message: 'Password reset not available for OAuth users' });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashToken(resetToken);
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store hashed token and expiry in database
        await pool.query(
            'UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 WHERE id = $3',
            [hashedToken, expiryTime, user.id]
        );

        // Send email with reset link (optional - gracefully fails)
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        try {
            await sendPasswordResetEmail(user.email, resetLink, user.name);
        } catch (emailError) {
            console.warn('⚠ Email sending skipped (development mode)');
        }

        res.status(200).json({
            message: 'If email exists, reset link has been sent. Check your inbox!'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password - Verify token and update password
export const resetPassword = async (req, res) => {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
        return res.status(400).json({ message: 'Token, email, and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const hashedToken = hashToken(token);

        // Find user with matching reset token
        const result = await pool.query(
            'SELECT id, email, password_reset_token, password_reset_expiry, auth_provider FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid reset request' });
        }

        const user = result.rows[0];

        if (user.auth_provider !== 'local') {
            return res.status(400).json({ message: 'Password reset not available for OAuth users' });
        }

        // Check if token matches and hasn't expired
        if (user.password_reset_token !== hashedToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        if (new Date() > new Date(user.password_reset_expiry)) {
            // Clear expired token
            await pool.query(
                'UPDATE users SET password_reset_token = NULL, password_reset_expiry = NULL WHERE id = $1',
                [user.id]
            );
            return res.status(400).json({ message: 'Reset token has expired. Please request a new one' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Password reset successful. Please log in with your new password' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
