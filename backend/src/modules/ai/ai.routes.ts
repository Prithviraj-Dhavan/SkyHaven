import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { aiQuerySchema } from './ai.schema.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/parse', aiLimiter, validate(aiQuerySchema), AiController.parse);

export const aiRoutes = router;
