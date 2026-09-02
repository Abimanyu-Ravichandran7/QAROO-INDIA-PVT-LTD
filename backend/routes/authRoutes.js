import { Router } from 'express';
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
// Protected password change with email-OTP verification (sent to the user's registered email).
router.post('/change-password', protect, changePassword);
router.post('/change-password/send-otp', protect, sendPasswordChangeOtp);

export default router;
