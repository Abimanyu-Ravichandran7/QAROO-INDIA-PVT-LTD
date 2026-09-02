import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function generateAccessToken(admin) {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

export function generateRefreshToken(admin) {
  return jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET + '_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

export function generateTokens(admin) {
  return {
    accessToken: generateAccessToken(admin),
    refreshToken: generateRefreshToken(admin),
  };
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateOTP(length = 6) {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

export function setAuthCookies(res, tokens) {
  const isProd = process.env.NODE_ENV === 'production';
  const base = { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' };
  res.cookie('accessToken', tokens.accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { httpOnly: true, path: '/' });
  res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
}
