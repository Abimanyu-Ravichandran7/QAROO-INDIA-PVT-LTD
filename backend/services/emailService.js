import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
}

// Returns the fallback verification link when email is not configured.
function fallbackLog(to, subject, text) {
  console.log('\n[EmailService: SMTP not configured — email not sent]');
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body:\n${text}\n`);
}

export async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    fallbackLog(to, subject, text || '');
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'Qaroo India Private Limited <no-reply@qaroo.in>',
      to,
      subject,
      text,
      html,
    });
    return { skipped: false };
  } catch (err) {
    console.error(`Email send error: ${err.message}`);
    fallbackLog(to, subject, text || '');
    return { skipped: true };
  }
}

export async function sendVerificationEmail(email, token) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${baseUrl}/admin/verify-email?token=${token}`;
  const subject = 'Verify your Qaroo Admin account';
  const text = `Verify your Qaroo Admin account\n\nClick here to verify your email:\n${link}`;
  const html = `<p>Verify your Qaroo Admin account</p><p><a href="${link}">Click here to verify your email</a></p><p>If the link does not work, copy this into your browser:<br/>${link}</p>`;
  return sendMail({ to: email, subject, text, html });
}

export async function sendApprovalEmail(email, name) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const loginUrl = `${baseUrl}/admin/login`;
  const subject = 'Your Qaroo Admin account has been approved';
  const text = `Hi ${name || 'there'},\n\nYour Qaroo Admin account has been approved. You can now log in here:\n${loginUrl}\n\nWelcome aboard!`;
  const html = `<p>Hi ${name || 'there'},</p><p>Your Qaroo Admin account has been <strong>approved</strong>. You can now log in here:</p><p><a href="${loginUrl}">${loginUrl}</a></p><p>Welcome aboard!</p>`;
  return sendMail({ to: email, subject, text, html });
}

export async function sendRejectionEmail(email, name) {
  const subject = 'Your Qaroo Admin account request was not approved';
  const text = `Hi ${name || 'there'},\n\nUnfortunately your Qaroo Admin account request was not approved. If you believe this is a mistake, please contact your administrator.`;
  const html = `<p>Hi ${name || 'there'},</p><p>Unfortunately your Qaroo Admin account request was <strong>not approved</strong>. If you believe this is a mistake, please contact your administrator.</p>`;
  return sendMail({ to: email, subject, text, html });
}

// The code is emailed to the ADMIN who creates the new user, not to the new user.
export async function sendAdminVerificationOTPEmail(creatorEmail, creatorName, userName, userEmail, otp) {
  const subject = `Verify the new Qaroo admin: ${userName}`;
  const text = `Hi ${creatorName || 'there'},\n\nYou created a new admin account:\nName: ${userName}\nEmail: ${userEmail}\n\nTheir verification code is:\n${otp}\n\nEnter this code in the Admin panel (Admin Management → Verify) to confirm ${userEmail}. The code expires in 10 minutes.\n\nDo not share this code.`;
  const html = `<p>Hi ${creatorName || 'there'},</p><p>You created a new admin account:</p><p><strong>${userName}</strong> (${userEmail})</p><p>Their verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#931913;text-align:center;padding:12px;background:#f4f4f4;border-radius:8px;">${otp}</p><p>Enter this code in the Admin panel (<strong>Admin Management → Verify</strong>) to confirm ${userEmail}. The code expires in 10 minutes.</p><p><em>Do not share this code.</em></p>`;
  return sendMail({ to: creatorEmail, subject, text, html });
}

// Sent to the NEW user after the Super Admin successfully verifies their account via OTP.
// Includes the login credentials (username + password) so the user can sign in.
export async function sendVerificationSuccessEmail(email, name, initialPassword) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const loginUrl = `${baseUrl}/admin/login`;
  const subject = 'Your Qaroo Admin account is verified — sign in with these credentials';
  const cred =
    initialPassword
      ? `\n\nUsername: ${email}\nPassword: ${initialPassword}\n`
      : '';
  const text = `Hi ${name || 'there'},\n\nYour Qaroo Admin account has been verified and is now active.\n${cred}\nYou can sign in here:\n${loginUrl}\n\nFor security, change your password after your first login.`;
  const credHtml =
    initialPassword
      ? `<table style="border-collapse:collapse;margin:12px 0;"><tr><td style="padding:8px 14px;border:1px solid #ddd;">Username</td><td style="padding:8px 14px;border:1px solid #ddd;font-weight:bold;">${email}</td></tr><tr><td style="padding:8px 14px;border:1px solid #ddd;">Password</td><td style="padding:8px 14px;border:1px solid #ddd;font-weight:bold;">${initialPassword}</td></tr></table>`
      : '';
  const html = `<p>Hi ${name || 'there'},</p><p>Your <strong>Qaroo Admin</strong> account has been verified and is now active.</p>${credHtml}<p>You can sign in here: <a href="${loginUrl}">${loginUrl}</a></p><p><em>For security, change your password after your first login.</em></p>`;
  return sendMail({ to: email, subject, text, html });
}

// OTP sent to the user's registered admin email when they change their password.
export async function sendPasswordChangeOtpEmail(email, name, otp) {
  const subject = 'Your Qaroo Admin password change code';
  const text = `Hi ${name || 'there'},\n\nYour verification code for changing your Qaroo Admin password is:\n\n${otp}\n\nEnter this code in the Change Password page. It expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.`;
  const html = `<p>Hi ${name || 'there'},</p><p>Your verification code for changing your Qaroo Admin password is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#931913;text-align:center;padding:12px;background:#f4f4f4;border-radius:8px;">${otp}</p><p>Enter this code in the <strong>Change Password</strong> page. It expires in 10 minutes.</p><p>If you did not request this, you can safely ignore this email.</p>`;
  return sendMail({ to: email, subject, text, html });
}

// Password reset link emailed to the user (forgot password).
export async function sendPasswordResetEmail(email, name, link) {
  const subject = 'Reset your Qaroo Admin password';
  const text = `Hi ${name || 'there'},\n\nYou requested to reset your Qaroo Admin password.\n\nClick this link to choose a new password:\n${link}\n\nIf you did not request this, you can safely ignore this email.`;
  const html = `<p>Hi ${name || 'there'},</p><p>You requested to reset your Qaroo Admin password.</p><p><a href="${link}">Click this link to choose a new password</a></p><p>If the link does not work, copy this into your browser:<br/>${link}</p><p>If you did not request this, you can safely ignore this email.</p>`;
  return sendMail({ to: email, subject, text, html });
}
