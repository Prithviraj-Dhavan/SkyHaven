import { Router } from 'express';
import { FeedbackController } from './feedback.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Allow authenticated or guest users to submit feedback
router.post('/', optionalAuthenticate, FeedbackController.submit);

// Admin only
router.get('/', authenticate, requireRole('ADMIN'), FeedbackController.getAll);

export const feedbackRoutes = router;
