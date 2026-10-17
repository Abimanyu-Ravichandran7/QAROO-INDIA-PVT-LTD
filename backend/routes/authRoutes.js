import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  deleteMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendPasswordChangeOtp,
  changePassword,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireVerifiedApproved } from '../middleware/adminMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, requireVerifiedApproved, getMe);
router.delete('/me', protect, deleteMe);
router.get('/verify-email/:token', optionalAuth, verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
// A password change is authorised by the emailed code alone, so these two are
// held well below the shared /api/auth allowance of 100 per window. The code
// itself also has a per-code attempt limit in the controller; this bounds how
// fast fresh codes can be requested, and stops a mailbox being flooded.
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification codes requested. Try again in 15 minutes.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Protected password change, authorised by an email OTP sent to the admin's
// registered address. The current password is deliberately not required: proving
// control of the registered mailbox is the factor.
router.post('/change-password', protect, otpVerifyLimiter, changePassword);
router.post('/change-password/send-otp', protect, otpSendLimiter, sendPasswordChangeOtp);

export default router;
