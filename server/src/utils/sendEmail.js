import sgMail from '@sendgrid/mail';

// Initialize SendGrid (if valid key provided)
const isValidSendGridKey = () => {
  const key = process.env.SENDGRID_API_KEY;
  return key && key.startsWith('SG_');
};

if (isValidSendGridKey()) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Send password reset email using SendGrid
export const sendPasswordResetEmail = async (email, resetLink, userName = 'User') => {
  try {
    // Skip if no valid API key
    if (!isValidSendGridKey()) {
      console.log('ℹ Email service not configured (set valid SENDGRID_API_KEY to enable)');
      return null;
    }

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@codingplatform.com',
      subject: 'Password Reset Request - Coding Competition Platform',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #333;">Password Reset Request</h2><p>Hello ${userName},</p><p>We received a request to reset your password on the Coding Competition Platform. Click the link below to reset your password:</p><p style="margin: 30px 0;"><a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a></p><p style="color: #666; font-size: 12px;">Or copy and paste this link in your browser:<br/><code>${resetLink}</code></p><p style="color: #999; font-size: 12px;">This link will expire in 15 minutes for security reasons.</p><p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email. Your account is safe.</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"><p style="color: #999; font-size: 11px; text-align: center;">Coding Competition Platform | © 2026 All rights reserved</p></div>`
    };

    const result = await sgMail.send(msg);
    console.log('✓ Password reset email sent to:', email);
    return result;
  } catch (error) {
    console.warn('⚠ Email sending skipped:', error.message);
    // Don't throw - email is optional, password reset token is still valid
    return null;
  }
};

// Send welcome email using SendGrid
export const sendWelcomeEmail = async (email, userName = 'User') => {
  try {
    // Skip if no valid API key
    if (!isValidSendGridKey()) {
      return null;
    }

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@codingplatform.com',
      subject: 'Welcome to Coding Competition Platform',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #333;">Welcome, ${userName}!</h2><p>Thank you for joining the Coding Competition Platform. We're excited to have you on board!</p><p>You can now:</p><ul><li>Solve competitive programming problems</li><li>Test your code against multiple test cases</li><li>Participate in contests</li><li>Track your progress and submissions</li></ul><p>Get started by visiting: <a href="http://localhost:3000">Coding Platform</a></p><p style="color: #999; font-size: 12px;">If you have any questions or need support, feel free to reach out.</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"><p style="color: #999; font-size: 11px; text-align: center;">Coding Competition Platform | © 2026 All rights reserved</p></div>`
    };

    const result = await sgMail.send(msg);
    console.log('✓ Welcome email sent to:', email);
    return result;
  } catch (error) {
    console.warn('⚠ Welcome email skipped:', error.message);
    return null;
  }
};
