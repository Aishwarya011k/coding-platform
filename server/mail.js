// Support both SMTP (nodemailer) and SendGrid API
let useSendGrid = Boolean(process.env.SENDGRID_API_KEY);
let sgMail = null;
try {
  if (useSendGrid) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) {
  // sendgrid package not installed; fall back to SMTP
  useSendGrid = false;
}

const nodemailer = require('nodemailer');
let transporter = null;
const useDirect = process.env.SEND_DIRECT === 'true';
let directTransport = null;
if (useDirect) {
  try { directTransport = require('nodemailer-direct-transport'); } catch (e) { directTransport = null; }
}
if (!useSendGrid) {
  if (useDirect && directTransport) {
    // direct-transport will try to deliver to recipient MX. Not reliable for production.
    transporter = nodemailer.createTransport(directTransport());
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
}

function _defaultFrom() {
  return process.env.SMTP_FROM || 'no-reply@example.com';
}

async function sendOtpEmail(to, code, purpose) {
  const subject = purpose === 'verify' ? 'Your verification code' : 'Your password reset code';
  const text = `Your ${purpose} code is: ${code}\nThis code expires in 15 minutes.`;
  const html = `<p>Your ${purpose} code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`;
  if (useSendGrid && sgMail) {
    return sgMail.send({ to, from: _defaultFrom(), subject, text, html });
  }
  return transporter.sendMail({ from: _defaultFrom(), to, subject, text, html });
}

async function sendTestEmail(to, subject, text, html) {
  const s = subject || 'Test email from Coding Platform';
  const t = text || 'This is a test email from your coding platform installation.';
  const h = html || `<p>${t}</p>`;
  if (useSendGrid && sgMail) {
    return sgMail.send({ to, from: _defaultFrom(), subject: s, text: t, html: h });
  }
  return transporter.sendMail({ from: _defaultFrom(), to, subject: s, text: t, html: h });
}

async function verifyTransporter() {
  if (useSendGrid) {
    if (!process.env.SENDGRID_API_KEY) return { ok: false, error: 'SENDGRID_API_KEY missing' };
    return { ok: true, provider: 'sendgrid' };
  }
  if (useDirect) {
    // direct transport has no verify step; we can report that direct delivery is configured but not verifyable here.
    if (!directTransport) return { ok: false, error: 'nodemailer-direct-transport not installed', provider: 'direct' };
    return { ok: true, provider: 'direct' };
  }
  try {
    await transporter.verify();
    return { ok: true, provider: 'smtp' };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e), provider: 'smtp' };
  }
}

module.exports = { sendOtpEmail, sendTestEmail, verifyTransporter };
