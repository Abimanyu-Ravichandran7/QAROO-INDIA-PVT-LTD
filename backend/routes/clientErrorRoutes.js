import { Router } from 'express';
import { reportClientError, listClientErrors } from '../controllers/clientErrorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireVerifiedApproved, requireSuperAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Public endpoint - browser crash reports.
router.post('/', reportClientError);

// Review logged frontend errors (Super Admin only).
router.get('/', protect, requireVerifiedApproved, requireSuperAdmin, listClientErrors);

export default router;